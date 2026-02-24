import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import FormBuilder from '../../components/FormBuilder';
import LexicalInput from '../../components/Input/lexicalWYSWYG/LexicalInput';

function TaskHowStep({ onTaskHowStepChange, taskHowFormModel }) {
  const [howFormModel, setHowFormModel] = useState({});
  const { t } = useTranslation();

  const handleLexicalInput = (data) => {
    setHowFormModel((prevState) => ({ ...prevState, task_description: data }));
  };

  useEffect(() => {
    setHowFormModel(taskHowFormModel || {});
  }, [taskHowFormModel]);

  useEffect(() => {
    onTaskHowStepChange && onTaskHowStepChange(howFormModel);
  }, [howFormModel, onTaskHowStepChange]);

  const FormDataHow = [
    {
      id: 'tracking',
      label: `${t('type_of_tracking')}`,
      type: 'dropdown',
      defaultValue: '',
      options: [
        { value: 'default', label: t('default') },
        { value: 'verification_list', label: t('checklist') }
      ]
    },
    {
      id: 'internal_comments',
      label: `${t('allow_internal_comments')}`,
      type: 'switch',
      defaultValue: false
    },
    {
      id: 'upload',
      label: `${t('user_upload')}`,
      type: 'switch',
      defaultValue: false
    }
  ];

  return (
    <>
      <Typography variant="body1" margin="20px 0">
        {t('how_step_description')}
      </Typography>
      <FormBuilder 
        showActionButton={false} 
        inputFields={FormDataHow} 
        controlled={true}
        initialValues={howFormModel}
        onChange={(id, value) => {
          setHowFormModel((prevState) => ({ ...prevState, [id]: value }));
        }}
      />
      <LexicalInput placeholder={t('training_material')} JSONData={handleLexicalInput} />
    </>
  );
}

export default TaskHowStep;
