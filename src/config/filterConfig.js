//import { useTranslation } from 'react-i18next';
//const { t } = useTranslation();
import i18n from 'i18next';
import {
  PERMIT_AUTHORITY_OPTIONS,
  PERMIT_STATUS_OPTIONS,
  PERMIT_TYPE_OPTIONS,
  PERMIT_UNIT_OPTIONS
} from '../features/permitManager/permitManagerData';

const textSearchField = {
  labelKey: 'Keywords',
  type: 'text-search-field',
  name: 'filter_keywords',
  default_value: '',
  group_by_key: 'search_by',
  group_by_label: 'SearchBy',
  fieldStyle: {
    width: '100%',
    borderRadius: '5px'
  }
};

const dateRangeField = {
  labelKey: '',
  type: 'date-range',
  name: ['filter_start_date', 'filter_end_date'],
  default_value: null,
  group_by_key: 'date',
  group_by_label: 'DateRange',
  fieldAttrs: {
    direction: 'column'
  }
};

const dropdownAdminList = {
  type: 'autocomplete',
  name: 'filter_sender',
  default_value: '',
  options: [],
  storageType: 'global',
  storageKey: 'listOfUsers',
  group_by_key: 'filter_by',
  group_by_label: 'FilterBy'
};

const dropdownExecutorList = {
  type: 'autocompleteWithoutLevel',
  name: 'filter_executor',
  default_value: '',
  options: [],
  storageType: 'global',
  storageKey: 'listOfUsers',
  group_by_key: 'filter_by',
  group_by_label: 'FilterBy',
  minSearchLength: 3
};

const dropdownReviewerList = {
  type: 'autocompleteWithoutLevel',
  name: 'filter_reviewer',
  default_value: '',
  options: [],
  storageType: 'global',
  storageKey: 'listOfUsers',
  group_by_key: 'filter_by',
  group_by_label: 'FilterBy',
  minSearchLength: 3
};

export const filterConfigs = {
  LegalMatriz: [
    textSearchField,
    {
      labelKey: 'type',
      type: 'autocompleteWithoutLevel',
      name: 'filter_tipo',
      default_value: '',
      options: [
        { value: 'General', label: 'General' },
        { value: 'Específico', label: 'Específico' }
      ],
      api_details: {}
    },
    /*
    {
      labelKey: 'type_of_rule',
      type: 'autocompleteWithoutLevel',
      name: 'filter_type_rule',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/legal_api/list_noram_tipo_requisito'
      },
      
    },
    */
    /*
    {
      labelKey: 'Category',
      type: 'autocompleteWithoutLevel',
      name: 'filter_category',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/legal_api/list_legal_categories'
      },
    },
    */
    {
      labelKey: 'Date_field',
      type: 'autocompleteWithoutLevel',
      name: 'filter_nameDateField',
      default_value: '',
      //options: [],
      options: [
        { value: 'date_of_issue_notification', label: 'date_of_issue_notification' },
        { value: 'effective_date', label: 'effective_date' },
        { value: 'renovation_date', label: 'renovation_date' },
        { value: 'modified_date', label: 'modified_date' }
      ],
      api_details: {}
    },
    {
      labelKey: 'Range_date',
      type: 'date-range',
      name: ['filter_start_date', 'filter_end_date'],
      default_value: null,
      fieldAttrs: {
        direction: 'column'
      },
      group_by_key: 'date',
      group_by_label: 'DateRange'
    }
  ],
  notifications: [
    textSearchField,
    {
      labelKey: 'Category',
      type: 'autocomplete',
      name: 'filter_module_string',
      default_value: '',
      options: [],
      group_by_key: 'filter_by',
      group_by_label: 'FilterBy'
    },
    dateRangeField
  ],
  permit_manager: [
    textSearchField,
    {
      labelKey: 'Unidad',
      type: 'autocompleteWithoutLevel',
      name: 'filter_unit',
      default_value: '',
      options: PERMIT_UNIT_OPTIONS,
      group_by_key: 'filter_by',
      group_by_label: 'FilterBy'
    },
    {
      labelKey: 'Tipo de permiso',
      type: 'autocompleteWithoutLevel',
      name: 'filter_permit_type',
      default_value: '',
      options: PERMIT_TYPE_OPTIONS,
      group_by_key: 'filter_by',
      group_by_label: 'FilterBy'
    },
    {
      labelKey: 'Autoridad',
      type: 'autocompleteWithoutLevel',
      name: 'filter_authority',
      default_value: '',
      options: PERMIT_AUTHORITY_OPTIONS,
      group_by_key: 'filter_by',
      group_by_label: 'FilterBy'
    },
    {
      labelKey: 'Estado del trámite',
      type: 'autocompleteWithoutLevel',
      name: 'filter_status',
      default_value: '',
      options: PERMIT_STATUS_OPTIONS,
      group_by_key: 'filter_by',
      group_by_label: 'FilterBy'
    },
    {
      labelKey: 'Semáforo',
      type: 'color-chips',
      name: 'filter_semaforo',
      default_value: null,
      options: [
        { value: '1', label: 'Sin desviaciones (Verde)', color: '#4caf50' },
        { value: '2', label: 'Desviaciones atendibles (Amarillo)', color: '#ffc107' },
        { value: '3', label: 'Desviaciones críticas (Rojo)', color: '#f44336' }
      ],
      group_by_key: 'filter_by',
      group_by_label: 'FilterBy'
    }
  ],
  legal_comunications: [
    {
      labelKey: 'search',
      type: 'text-search-field',
      name: 'filter_keywords',
      default_value: '',
      group_by_key: 'search_by',
      group_by_label: 'SearchBy',
      fieldStyle: {
        width: '100%',
        borderRadius: '5px'
      }
    },
    {
      labelKey: 'status',
      type: 'autocompleteWithoutLevel',
      name: 'filter_status',
      default_value: '',
      options: [
        { value: 'open', label: i18n.t('open') },
        { value: 'in_progress', label: i18n.t('in_progress') },
        { value: 'expired', label: i18n.t('expired') },
        { value: 'resolved', label: i18n.t('resolved') }
      ],
      group_by_key: 'filter_by',
      group_by_label: 'FilterBy'
    },
    {
      labelKey: 'source_type',
      type: 'autocompleteWithoutLevel',
      name: 'filter_source_type',
      default_value: '',
      options: [
        { value: 'GOVT', label: i18n.t('government') },
        { value: 'USER', label: i18n.t('user_community') },
        { value: 'INTERNAL', label: i18n.t('internal') }
      ],
      group_by_key: 'filter_by',
      group_by_label: 'FilterBy'
    },
    {
      labelKey: 'communication_mode',
      type: 'autocompleteWithoutLevel',
      name: 'filter_mode',
      default_value: '',
      options: [
        { value: 'LETTER', label: i18n.t('letter') },
        { value: 'EMAIL', label: i18n.t('email') },
        { value: 'PORTAL', label: i18n.t('portal') },
        { value: 'IN_PERSON', label: i18n.t('in_person') },
        { value: 'PHONE', label: i18n.t('phone') }
      ],
      group_by_key: 'filter_by',
      group_by_label: 'FilterBy'
    }
  ],
  events: [
    textSearchField,
    // Configuration for events filters
    {
      labelKey: 'Status',
      type: 'autocompleteWithoutLevel',
      name: 'filter_status',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/tasklist_api/list_task_status'
      },
      group_by_key: 'filter_by',
      group_by_label: 'FilterBy'
    },
    {
      // TODO: Both dropdowns are the same. I need to individually fetch the options for each dropdown.
      ...dropdownExecutorList,
      labelKey: 'Executor'
    },
    {
      // TODO: Both dropdowns are the same. I need to individually fetch the options for each dropdown.
      ...dropdownReviewerList,
      labelKey: 'Reviewer'
    },

    {
      labelKey: 'Etiquetas',
      type: 'autocompleteWithoutLevel',
      name: 'Etiquetas',
      default_value: '',
      //options: [],
      options: [],
      api_details: {
        api_url: '/message_center_api/tasklist_api/list_tags'
      },
      group_by_key: 'filter_by',
      group_by_label: 'FilterBy'
    },

    {
      labelKey: 'SortBy',
      type: 'autocompleteWithoutLevel',
      name: 'sort_by',
      default_value: '',
      options: [
        { value: '1', label: 'SortByAZ' },
        { value: '2', label: 'SortByZA' },
        { value: '3', label: 'SortByNewest' },
        { value: '4', label: 'SortByOldest' }
      ],
      api_details: {},
      group_by_key: 'sort_by',
      group_by_label: 'sort'
    },

    dateRangeField
  ],
  events_table: [
    textSearchField,
    // Configuration for events filters
    {
      // TODO: Both dropdowns are the same. I need to individually fetch the options for each dropdown.
      ...dropdownReviewerList,
      labelKey: 'Executor'
    },
    {
      // TODO: Both dropdowns are the same. I need to individually fetch the options for each dropdown.
      ...dropdownReviewerList,
      labelKey: 'Reviewer'
    },
    dateRangeField
  ],
  events_list: [
    textSearchField,
    // Configuration for events filters
    {
      // TODO: Both dropdowns are the same. I need to individually fetch the options for each dropdown.
      ...dropdownReviewerList,
      labelKey: 'Executor'
    },
    {
      // TODO: Both dropdowns are the same. I need to individually fetch the options for each dropdown.
      ...dropdownReviewerList,
      labelKey: 'Reviewer'
    }
  ],
  /*
  ,
  events: [
    textSearchField,
    // Configuration for events filters
    {
      labelKey: 'Status',
      type: 'autocomplete',
      name: 'filter_status',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/tasklist_api/list_task_status'
      }
    },
    {
      // TODO: Both dropdowns are the same. I need to individually fetch the options for each dropdown.
      ...dropdownReviewerList,
      labelKey: 'Reviewer'
    },
    dateRangeField,
    {
      labelKey: 'Negocio',
      type: 'autocomplete',
      name: 'filter_business',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/tasklist_api/list_level1'
      },
      level: 1
    },
    {
      labelKey: 'Compañía',
      type: 'autocomplete',
      name: 'filter_company',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/tasklist_api/get_level2 '
      },
      level: 2
    },
    {
      labelKey: 'Región',
      type: 'autocomplete',
      name: 'filter_region',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/tasklist_api/list_level1'
      },
      level: 1
    },
    {
      labelKey: 'Localidad',
      type: 'autocomplete',
      name: 'filter_location',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/tasklist_api/list_location'
      }
    }
  ],
  */

  findings: [
    textSearchField,
    {
      labelKey: 'country',
      type: 'autocompleteWithoutLevel',
      name: 'filter_country',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/inspecciones_api/get_dropdown_options',
        responseKey: 'area_options'
      }
    },
    {
      labelKey: 'company',
      type: 'autocompleteWithoutLevel',
      name: 'filter_company',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/inspecciones_api/get_dropdown_options',
        responseKey: 'area_options'
      }
    },
    {
      labelKey: 'department',
      type: 'autocompleteWithoutLevel',
      name: 'filter_department',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/inspecciones_api/get_dropdown_options',
        responseKey: 'area_options'
      }
    },
    {
      labelKey: 'city',
      type: 'autocompleteWithoutLevel',
      name: 'filter_city',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/inspecciones_api/get_dropdown_options',
        responseKey: 'area_options'
      }
    },
    {
      labelKey: 'management',
      type: 'autocompleteWithoutLevel',
      name: 'filter_management',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/inspecciones_api/get_dropdown_options',
        responseKey: 'managements'
      }
    },
    {
      labelKey: 'Contractor',
      type: 'autocompleteWithoutLevel',
      name: 'filter_Contractor',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/inspecciones_api/get_dropdown_options',
        responseKey: 'contractors'
      }
    },
    {
      labelKey: 'person_registering',
      type: 'autocompleteWithoutLevel',
      name: 'filter_person_registering',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/inspecciones_api/get_dropdown_options',
        responseKey: 'reporting_persons'
      }
    },
    dateRangeField,
    {
      labelKey: 'Status',
      type: 'autocompleteWithoutLevel',
      name: 'filter_Status',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/inspecciones_api/get_dropdown_options',
        responseKey: 'status'
      }
    },
    {
      labelKey: 'source_of_the_finding',
      type: 'autocompleteWithoutLevel',
      name: 'filter_source_of_the_finding',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/inspecciones_api/get_dropdown_options',
        responseKey: 'finding_sources'
      }
    }
  ],

  actions: [
    textSearchField,
    // Configuration for actions filters
    {
      labelKey: 'Status',
      type: 'autocompleteWithoutLevel',
      name: 'filter_status',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/action_api/dashboard_actions_status'
      }
    },
    {
      labelKey: 'Category',
      type: 'autocompleteWithoutLevel',
      name: 'filter_module_string',
      default_value: '',
      options: [],
      api_details: {
        api_url: '/message_center_api/action_api/list_action_categories'
      }
    },
    {
      // TODO: Both dropdowns are the same. I need to individually fetch the options for each dropdown.
      ...dropdownExecutorList,
      labelKey: 'Executor'
    },
    {
      // TODO: Both dropdowns are the same. I need to individually fetch the options for each dropdown.
      ...dropdownReviewerList,
      labelKey: 'Reviewer'
    }
  ]
};
