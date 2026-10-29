import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { Language } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher({ light = false }) {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage === 'am' ? 'am' : 'en';
  const nextLanguage = currentLanguage === 'am' ? 'en' : 'am';

  const switchLanguage = () => {
    i18n.changeLanguage(nextLanguage);
  };

  return (
    <Tooltip title={t('common.switchLanguage')}>
      <Button
        onClick={switchLanguage}
        color="inherit"
        size="small"
        aria-label={t('common.switchLanguage')}
        startIcon={<Language />}
        sx={{
          minWidth: 0,
          px: { xs: 1, sm: 1.5 },
          borderRadius: 2,
          color: light ? 'common.white' : 'text.primary',
          border: light ? '1px solid rgba(255,255,255,.35)' : '1px solid',
          borderColor: light ? 'rgba(255,255,255,.35)' : 'divider',
          fontWeight: 700,
          '&:hover': { bgcolor: light ? 'rgba(255,255,255,.12)' : 'action.hover' }
        }}
      >
        {currentLanguage === 'am' ? 'አማ' : 'EN'}
      </Button>
    </Tooltip>
  );
}
