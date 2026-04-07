import { fetchActionListLevel } from '../../stores/actions/fetchActionListLevelSlice';

const FIELD_TO_API_KEY = {
  level1: 'id_level1',
  level2: 'id_level2',
  level3: 'id_level3',
  level4: 'id_level4',
  level_1: 'id_level1',
  level_2: 'id_level2',
  level_3: 'id_level3',
  level_4: 'id_level4'
};

export const buildActionLevelsFormData = (selectedValues = {}) => {
  const formData = new FormData();

  Object.entries(selectedValues).forEach(([fieldKey, fieldValue]) => {
    if (!fieldValue) return;

    const apiKey = FIELD_TO_API_KEY[fieldKey] || `id_${fieldKey}`;
    formData.append(apiKey, fieldValue);
  });

  return formData;
};

export const fetchActionLevelOptions = async ({ dispatch, level, selectedValues = {} }) => {
  const formData = buildActionLevelsFormData(selectedValues);
  const hasParams = Array.from(formData.keys()).length > 0;

  const payload = hasParams ? { level, formData } : { level };
  const response = await dispatch(fetchActionListLevel(payload));
  const apiResponse = response?.payload?.data;

  if (apiResponse?.messages !== 'Success' || !Array.isArray(apiResponse?.data)) {
    throw new Error(`Failed to fetch level ${level} data`);
  }

  return apiResponse.data.map((item) => ({
    value: item.value,
    label: item.label
  }));
};
