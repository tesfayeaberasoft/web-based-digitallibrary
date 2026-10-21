<?php

const EBOOK_MAX_SIZE_BYTES = 52428800;

class EbookUploadException extends RuntimeException {
}

function getEbookStorageDirectory() {
    return dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'private-storage' . DIRECTORY_SEPARATOR . 'ebooks';
}

function storeEbookUpload($file) {
    if (!isset($file) || !is_array($file)) {
        return null;
    }

    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        $uploadErrors = [
            UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the server upload limit.',
            UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the form upload limit.',
            UPLOAD_ERR_PARTIAL => 'The file upload was incomplete.',
            UPLOAD_ERR_NO_FILE => 'No eBook file was selected.',
            UPLOAD_ERR_NO_TMP_DIR => 'The server upload directory is unavailable.',
            UPLOAD_ERR_CANT_WRITE => 'The server could not save the uploaded file.',
            UPLOAD_ERR_EXTENSION => 'A server extension stopped the file upload.',
        ];
        throw new EbookUploadException($uploadErrors[$file['error']] ?? 'The file upload failed.');
    }

    $size = (int) ($file['size'] ?? 0);
    if ($size <= 0 || $size > EBOOK_MAX_SIZE_BYTES) {
        throw new EbookUploadException('eBook files must be between 1 byte and 50 MB.');
    }

    $extension = strtolower(pathinfo($file['name'] ?? '', PATHINFO_EXTENSION));
    if (!in_array($extension, ['pdf', 'epub'], true)) {
        throw new EbookUploadException('Only PDF and EPUB files are supported.');
    }

    $temporaryPath = $file['tmp_name'] ?? '';
    if ($temporaryPath === '' || !is_uploaded_file($temporaryPath)) {
        throw new EbookUploadException('The uploaded file could not be verified.');
    }

    $handle = fopen($temporaryPath, 'rb');
    if ($handle === false) {
        throw new RuntimeException('The uploaded file could not be read.');
    }
    $signature = fread($handle, 8);
    fclose($handle);

    $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($temporaryPath);
    $validPdf = $extension === 'pdf'
        && $mimeType === 'application/pdf'
        && strncmp($signature, '%PDF-', 5) === 0;
    $validEpub = $extension === 'epub'
        && in_array($mimeType, ['application/epub+zip', 'application/zip', 'application/x-zip', 'application/octet-stream'], true)
        && strncmp($signature, "PK\x03\x04", 4) === 0;

    if (!$validPdf && !$validEpub) {
        throw new EbookUploadException('The file contents do not match a valid PDF or EPUB file.');
    }
    if ($validEpub) {
        if (!class_exists('ZipArchive')) {
            throw new RuntimeException('The PHP zip extension is required to validate EPUB files.');
        }
        $archive = new ZipArchive();
        if ($archive->open($temporaryPath) !== true) {
            throw new EbookUploadException('The uploaded EPUB archive is invalid.');
        }
        $mimetypeEntry = $archive->statIndex(0);
        $validEpubArchive = $mimetypeEntry !== false
            && $mimetypeEntry['name'] === 'mimetype'
            && $mimetypeEntry['comp_method'] === ZipArchive::CM_STORE
            && $archive->getFromIndex(0) === 'application/epub+zip';
        $expandedSize = 0;
        for ($index = 0; $validEpubArchive && $index < $archive->numFiles; $index++) {
            $entry = $archive->statIndex($index);
            if ($entry === false) {
                $validEpubArchive = false;
                break;
            }
            $expandedSize += (int) $entry['size'];
            if ($expandedSize > 262144000) {
                $validEpubArchive = false;
            }
        }
        $validEpubArchive = $validEpubArchive
            && $archive->locateName('META-INF/container.xml') !== false;
        $archive->close();
        if (!$validEpubArchive) {
            throw new EbookUploadException('The EPUB archive is invalid or exceeds the 250 MB expanded-size limit.');
        }
    }

    $directory = getEbookStorageDirectory();
    if (!is_dir($directory) && !mkdir($directory, 0750, true) && !is_dir($directory)) {
        throw new RuntimeException('The eBook storage directory could not be created.');
    }

    $filename = bin2hex(random_bytes(16)) . '.' . $extension;
    $absolutePath = $directory . DIRECTORY_SEPARATOR . $filename;
    if (!move_uploaded_file($temporaryPath, $absolutePath)) {
        throw new RuntimeException('The uploaded eBook could not be saved.');
    }

    return [
        'path' => 'ebooks/' . $filename,
        'type' => $extension,
        'absolute_path' => $absolutePath,
    ];
}

function resolveEbookStoragePath($relativePath) {
    if (!is_string($relativePath)
        || !preg_match('/\Aebooks\/[a-f0-9]{32}\.(?:pdf|epub)\z/iD', $relativePath)) {
        return null;
    }

    $filename = substr($relativePath, strlen('ebooks/'));
    return getEbookStorageDirectory() . DIRECTORY_SEPARATOR . $filename;
}

function deleteStoredEbook($relativePath) {
    $absolutePath = resolveEbookStoragePath($relativePath);
    if ($absolutePath !== null && is_file($absolutePath) && !unlink($absolutePath)) {
        error_log('Unable to delete stored eBook: ' . basename($absolutePath));
    }
}
