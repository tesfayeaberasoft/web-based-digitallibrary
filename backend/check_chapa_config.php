<?php
/**
 * Chapa Configuration Checker
 * 
 * This script verifies that your Chapa payment gateway is properly configured
 * Run this after setting up your .env file
 * 
 * Usage: php check_chapa_config.php
 */

require_once __DIR__ . '/utils/EnvLoader.php';

echo "=================================================================\n";
echo "CHAPA PAYMENT GATEWAY - CONFIGURATION CHECK\n";
echo "=================================================================\n\n";

$errors = [];
$warnings = [];
$success = [];

// Check if .env file exists
$envFile = __DIR__ . '/.env';
if (!file_exists($envFile)) {
    $errors[] = ".env file not found. Copy .env.example to .env";
} else {
    $success[] = ".env file found";
    EnvLoader::load($envFile);
}

echo "🔍 Checking Configuration...\n";
echo "-----------------------------------------------------------------\n\n";

// Required environment variables
$requiredVars = [
    'CHAPA_SECRET_KEY' => 'Chapa Secret API Key',
    'CHAPA_PUBLIC_KEY' => 'Chapa Public API Key',
    'CHAPA_CALLBACK_URL' => 'Chapa Callback URL',
    'CHAPA_RETURN_URL' => 'Chapa Return URL'
];

foreach ($requiredVars as $var => $description) {
    $value = getenv($var);
    
    if (!$value || $value === '' || strpos($value, 'your_') === 0) {
        $errors[] = "❌ $var not configured ($description)";
    } else {
        $success[] = "✓ $var is set";
        
        // Additional validation
        if ($var === 'CHAPA_SECRET_KEY') {
            if (strpos($value, 'CHASECK') !== 0) {
                $warnings[] = "⚠️  $var doesn't look like a valid Chapa secret key (should start with CHASECK)";
            } else {
                if (strpos($value, 'TEST') !== false) {
                    $warnings[] = "ℹ️  Using TEST secret key (good for development)";
                } else {
                    echo "  └─ Using LIVE secret key ⚠️  (production mode)\n";
                }
            }
        }
        
        if ($var === 'CHAPA_CALLBACK_URL') {
            if (strpos($value, 'localhost') !== false && strpos($value, 'ngrok') === false) {
                $warnings[] = "⚠️  Callback URL uses localhost. Chapa won't be able to reach it. Use ngrok for local testing.";
            } elseif (strpos($value, 'https://') === 0) {
                $success[] = "✓ Callback URL uses HTTPS (secure)";
            } else {
                $warnings[] = "⚠️  Callback URL doesn't use HTTPS. Use HTTPS for production.";
            }
        }
    }
}

echo "\n";

// Check optional configuration
$optionalVars = [
    'CHAPA_MODE' => 'test',
    'CHAPA_CURRENCY' => 'ETB',
    'PAYMENT_MIN_AMOUNT' => '1.00',
    'PAYMENT_MAX_AMOUNT' => '10000.00'
];

foreach ($optionalVars as $var => $defaultValue) {
    $value = getenv($var);
    if ($value) {
        $success[] = "✓ $var = $value";
    } else {
        $warnings[] = "ℹ️  $var not set (will use default: $defaultValue)";
    }
}

echo "\n";

// Check PHP extensions
echo "🔧 Checking PHP Requirements...\n";
echo "-----------------------------------------------------------------\n";

$requiredExtensions = ['curl', 'json', 'pdo', 'pdo_mysql'];

foreach ($requiredExtensions as $ext) {
    if (extension_loaded($ext)) {
        echo "✓ PHP $ext extension is loaded\n";
    } else {
        $errors[] = "❌ PHP $ext extension is NOT loaded (required)";
    }
}

echo "\n";

// Check database connection
echo "🗄️  Checking Database Connection...\n";
echo "-----------------------------------------------------------------\n";

try {
    require_once __DIR__ . '/config/database.php';
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($conn) {
        echo "✓ Database connection successful\n";
        
        // Check if payment tables exist
        $tables = ['payments', 'payment_logs', 'payment_settings'];
        foreach ($tables as $table) {
            $stmt = $conn->query("SHOW TABLES LIKE '$table'");
            if ($stmt->rowCount() > 0) {
                echo "✓ Table '$table' exists\n";
            } else {
                $errors[] = "❌ Table '$table' not found. Run: php run_payment_migration.php";
            }
        }
    } else {
        $errors[] = "❌ Failed to connect to database";
    }
} catch (Exception $e) {
    $errors[] = "❌ Database error: " . $e->getMessage();
}

echo "\n";

// Check API connectivity
echo "🌐 Testing Chapa API Connectivity...\n";
echo "-----------------------------------------------------------------\n";

$secretKey = getenv('CHAPA_SECRET_KEY');
if ($secretKey && strpos($secretKey, 'your_') === false) {
    $ch = curl_init('https://api.chapa.co/v1/transaction/verify/test');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $secretKey,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) {
        $errors[] = "❌ Failed to connect to Chapa API: $curlError";
    } elseif ($httpCode >= 200 && $httpCode < 500) {
        echo "✓ Chapa API is reachable (HTTP $httpCode)\n";
        
        $responseData = json_decode($response, true);
        if ($responseData && isset($responseData['message'])) {
            echo "  └─ API Response: " . $responseData['message'] . "\n";
        }
    } else {
        $warnings[] = "⚠️  Unexpected HTTP response from Chapa API: $httpCode";
    }
} else {
    $warnings[] = "⚠️  Skipping API test (Chapa secret key not configured)";
}

echo "\n";

// Summary
echo "=================================================================\n";
echo "CONFIGURATION SUMMARY\n";
echo "=================================================================\n\n";

if (!empty($success)) {
    echo "✅ PASSED CHECKS (" . count($success) . "):\n";
    foreach ($success as $item) {
        echo "  $item\n";
    }
    echo "\n";
}

if (!empty($warnings)) {
    echo "⚠️  WARNINGS (" . count($warnings) . "):\n";
    foreach ($warnings as $item) {
        echo "  $item\n";
    }
    echo "\n";
}

if (!empty($errors)) {
    echo "❌ ERRORS (" . count($errors) . "):\n";
    foreach ($errors as $item) {
        echo "  $item\n";
    }
    echo "\n";
    echo "Please fix the errors above before using Chapa payment gateway.\n";
    echo "\n";
    exit(1);
} else {
    echo "🎉 All checks passed! Chapa payment gateway is ready to use.\n";
    echo "\n";
    echo "Next steps:\n";
    echo "1. Test payment flow with Chapa test cards\n";
    echo "2. Check payment logs in database\n";
    echo "3. Review CHAPA_SETUP_GUIDE.md for detailed instructions\n";
    echo "\n";
    exit(0);
}
