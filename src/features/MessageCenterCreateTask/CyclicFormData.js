import { Box, Button, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import FormBuilder from '../../components/FormBuilder';
import { daysNumbers, eng_months, esp_months } from '../../config/constants';

import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../providers/languageProvider';

function CyclicFormData({ formModel, onFormModelChange, alert }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [cyclicFormModel, setCyclicFormModel] = useState({});
  const [selectedDayButtons, setSelectedDayButtons] = useState(
    daysNumbers.slice(0, 30).reduce((acc, day) => ({ ...acc, [day.value]: false }), {})
  );
  const [selectedMonthButtons, setSelectedMonthButtons] = useState(
    language === 'es'
      ? esp_months.reduce((acc, month) => ({ ...acc, [month.value]: false }), {})
      : eng_months.reduce((acc, month) => ({ ...acc, [month.value]: false }), {})
  );

  useEffect(() => {
    setCyclicFormModel(formModel);
  }, []);

  useEffect(() => {
    onFormModelChange(cyclicFormModel);
  }, [cyclicFormModel, onFormModelChange]);

  const applyAlert = {
    id: 'apply_alert',
    label: `${t('apply_alert')}`,
    type: 'dropdown',
    options: alert
  };

  const toggleAllButtons = (buttons, setButtons) => {
    const allTrue = Object.values(buttons).every((value) => value);
    setButtons(Object.keys(buttons).reduce((acc, day) => ({ ...acc, [day]: !allTrue }), {}));
  };

  const handleButtonClick = (setButtons, value) => {
    setButtons((prevState) => ({
      ...prevState,
      [value]: !prevState[value]
    }));
  };

  const generateYears = (currentYear) => {
    let years = [];
    for (let i = currentYear - 4; i <= currentYear + 4; i++) {
      years.push({ value: i, label: i });
    }
    return years;
  };

  let yearsArray = generateYears(new Date().getFullYear());
  const [selectedYearButtons, setSelectedYearButtons] = useState(
    yearsArray.reduce((acc, year) => ({ ...acc, [year.value]: false }), {})
  );

  useEffect(() => {
    const currentYear = new Date().getFullYear();

    const losdias = Array.from({ length: 30 }, (_, i) =>
      selectedDayButtons[String(i + 1)] ? '1' : '0'
    ).join(',');

    const losmeses = Array.from({ length: 12 }, (_, i) =>
      selectedMonthButtons[String(i + 1)] ? '1' : '0'
    ).join(',');

    // 20 positions: indices 0-19, year = currentYear - 10 + i
    const losanos = Array.from({ length: 20 }, (_, i) => {
      const year = currentYear - 10 + i;
      return selectedYearButtons[String(year)] ? '1' : '0';
    }).join(',');

    const allDaysSelected = Object.values(selectedDayButtons).every((v) => v);

    setCyclicFormModel((prev) => {
      const next = { ...prev, losdias, losmeses, losanos };
      if (allDaysSelected) {
        next.todos_dias = '1';
      } else {
        delete next.todos_dias;
      }
      return next;
    });
  }, [selectedDayButtons, selectedMonthButtons, selectedYearButtons]);

  return (
    <>
      <Box>
        <Typography variant="h5">{t('days')}</Typography>
        <Box display="grid" gap={1} gridTemplateColumns="repeat(7, 1fr)">
          {daysNumbers.slice(0, 30).map((label) => (
            <Button
              key={label.value}
              variant={selectedDayButtons[label.value] ? 'contained' : 'outlined'}
              onClick={() => handleButtonClick(setSelectedDayButtons, label.value)}
            >
              {label.label}
            </Button>
          ))}
        </Box>
        <FormControlLabel
          control={<Checkbox />}
          label={t('all_days')}
          checked={Object.values(selectedDayButtons).every((value) => value)}
          onClick={() => toggleAllButtons(selectedDayButtons, setSelectedDayButtons)}
        />
      </Box>
      <Box>
        <Typography variant="h5">{t('months')}</Typography>
        <Box display="grid" gap={1} gridTemplateColumns="repeat(7, 1fr)">
          {language === 'es'
            ? esp_months.map((label) => (
                <Button
                  key={label.value}
                  variant={selectedMonthButtons[label.value] ? 'contained' : 'outlined'}
                  onClick={() => handleButtonClick(setSelectedMonthButtons, label.value)}
                >
                  {`${label.label.slice(0, 3)}`}
                </Button>
              ))
            : eng_months.map((label) => (
                <Button
                  key={label.value}
                  variant={selectedMonthButtons[label.value] ? 'contained' : 'outlined'}
                  onClick={() => handleButtonClick(setSelectedMonthButtons, label.value)}
                >
                  {`${label.label.slice(0, 3)}`}
                </Button>
              ))}
        </Box>
        <FormControlLabel
          control={<Checkbox />}
          label={t('all_months')}
          checked={Object.values(selectedMonthButtons).every((value) => value)}
          onClick={() => toggleAllButtons(selectedMonthButtons, setSelectedMonthButtons)}
        />
      </Box>
      <Box>
        <Typography variant="h5">{t('years')}</Typography>
        <Box display="grid" gap={1} gridTemplateColumns="repeat(7, 1fr)">
          {yearsArray.map((label) => (
            <Button
              key={label.value}
              variant={selectedYearButtons[label.value] ? 'contained' : 'outlined'}
              onClick={() => handleButtonClick(setSelectedYearButtons, label.value)}
            >
              {label.label}
            </Button>
          ))}
        </Box>
        <FormControlLabel
          control={<Checkbox />}
          label={t('all_years')}
          checked={Object.values(selectedYearButtons).every((value) => value)}
          onClick={() => toggleAllButtons(selectedYearButtons, setSelectedYearButtons)}
        />
      </Box>
      <Box sx={{ width: '80%' }}>
        <Typography>{t('apply_alert')}</Typography>
        <FormBuilder
          showActionButton={false}
          inputFields={[applyAlert]}
          initialValues={cyclicFormModel}
          controlled={true}
          onChange={(id, value) => {
            setCyclicFormModel((prevState) => ({ ...prevState, [id]: value }));
          }}
        />
      </Box>
    </>
  );
}

export default CyclicFormData;
