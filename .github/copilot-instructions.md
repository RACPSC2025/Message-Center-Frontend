# Message Center - AI Coding Agent Instructions

## Architecture Overview

This is a **React 18** single-page application for an environmental compliance and task management system, using:
- **Redux Toolkit** for state management (global store in [src/store.js](src/store.js))
- **Material-UI v5** with custom theme ([src/lib/theme.js](src/lib/theme.js))
- **Tailwind CSS** for utility styling
- **React Router v6** with `HashRouter` for navigation
- **Apollo Client** for GraphQL (configured in [src/apolloClient.js](src/apolloClient.js), currently unused placeholder)
- **i18next** for internationalization (Spanish default, English support)
- **Axios** for REST API communication ([src/lib/axios.js](src/lib/axios.js))

### Key Architectural Patterns

**Runtime Configuration System**: The app loads configuration from `public/config.json` at startup (see [src/config/runtimeConfig.js](src/config/runtimeConfig.js)). This allows changing API URLs and settings without rebuilding. Configuration loading happens **before** React renders via [src/index.js](src/index.js) - the root element shows a loading spinner until config loads successfully. Config includes `apiUrl`, `baseName`, `environment`, and `version`. Three environment configs exist: `config.development.json`, `config.production.json`, and `config.json` (active).

**Module-Based Architecture**: Features are organized by domain in [src/features/](src/features/):
- `MessageCenter*` - Core messaging functionality (top-level feature files)
- `MessageCenterEventsList/` - Task/event detail views with nested drawers
- `MessageCenterLegalMatriz/` - Legal matrix sub-components (forms, drawers, trees)
- `tasks/` - Task management
- `analysisRegulation/`, `articles/`, `compliance/`, `details/` - Legal requirement workflow steps
- `findings/` - Inspection findings
- `actions/`, `inspections/`, `events/`, `config/`

**Redux Store Organization**: State slices are grouped by feature domain under [src/stores/](src/stores/). Each feature has its own folder (e.g., `tasks/`, `legal/`, `messages/`) containing related slices. The main store configuration imports ~60 slices - see [src/store.js](src/store.js). Common slice pattern: `fetch*Slice.js` for async data fetching using `createAsyncThunk`.

**Layout System**: The app uses a persistent layout with collapsible navbar:
- [src/components/TheLayout.js](src/components/TheLayout.js) - Main layout container with 5-minute polling logic
- [src/components/TheLayoutNavbar.js](src/components/TheLayoutNavbar.js) - Left sidebar navigation
- [src/components/TheLayoutHeader.js](src/components/TheLayoutHeader.js) - Top header with language switcher, notifications badge
- Constants like `navbarWidth` (320px), `headerHeight` (50px) are in [src/config/constants.js](src/config/constants.js)

## Component Conventions

### Naming Patterns

**Base Components** (reusable UI primitives): Prefix with `Base` - e.g., `BaseFilter`, `BaseSortPopper`, `BaseFormControl`, `BaseTab`. These are generic, feature-agnostic components in [src/components/](src/components/).

**Feature Components**: Named with feature prefix - e.g., `MessageCenterActions`, `MessageCenterEventLists`, `EditEventDetailsDrawer`. Located in [src/features/](src/features/) or feature subfolders.

**Layout Components**: Prefix with `The` for singleton layout components - `TheLayout`, `TheLayoutHeader`, `TheLayoutNavbar`, `TheFullPageLoader`.

### Component Structure Example

From [src/components/BaseSortPopper.js](src/components/BaseSortPopper.js):
```javascript
const BaseSortPopper = ({
  sortByOptions,
  sortOrderOptions,
  selectedSortBy,
  // ... props
}) => {
  const { t } = useTranslation(); // Always use for text
  const [state, setState] = useState();
  
  return (
    <IconButton onClick={handleClick}>
      <SortIcon />
    </IconButton>
    // ... MUI components
  );
};
```

**Key patterns**:
- Use `useTranslation()` hook for **all** user-facing text - never hardcode strings
- Material-UI components are the standard UI library (no plain HTML buttons/inputs)
- Export components as default: `export default ComponentName`
- Use `Suspense` with `lazy()` for code splitting in routes

## State Management

### Redux Toolkit Async Thunks

Pattern for API calls (see [src/stores/messages/fetchDashboardMessageDetailsSlice.js](src/stores/messages/fetchDashboardMessageDetailsSlice.js)):
```javascript
export const fetchDashboardMessageDetails = createAsyncThunk(
  'dashboardMessage/fetchDashboardMessageDetails',
  async (messageId) => {
    const response = await axiosInstance.get(`/message/${messageId}`);
    return response.data;
  }
);
```

### Filter State Pattern

Global filter state is managed through [src/stores/filterSlice.js](src/stores/filterSlice.js) with selectors like `selectFilterItemValue`. Filter configurations are defined per-module in [src/config/filterConfig.js](src/config/filterConfig.js).

## API Integration

**Axios Instance**: All API calls use the configured instance from [src/lib/axios.js](src/lib/axios.js):
- Automatically adds `Auth-Token` and `System-Token` headers via request interceptor
- Base URL from runtime config (`API_URL` constant)
- Development mode uses `LOCAL_AUTH_TOKEN` constant (hardcoded)
- Production checks for token from `storage.getToken()` ([src/utils/storage.js](src/utils/storage.js))
- 600-second timeout for long-running requests

**Development Proxy**: [src/setupProxy.js](src/setupProxy.js) proxies `/api` requests in dev mode to avoid CORS issues. Configured with logging for debugging.

**Common API Patterns**:

```javascript
// Redux thunk for API calls
export const fetchData = createAsyncThunk(
  'feature/fetchData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/endpoint', params);
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

**API Endpoint Structure**: Most endpoints follow pattern:
- `/tasklist_api/*` - Task management endpoints (e.g., `/tasklist_api/add_logtask_comments_amatia_express`)
- `/message_center_api/*` - Message and notification endpoints
- `/message_center_api/legal_api/*` - Legal matrix endpoints
- `/message_center_api/action_api/*` - Action management endpoints

All POST requests use `FormData` or JSON, never URL-encoded params.

## Dashboard Message System (Critical Pattern)

**Important**: When creating or updating entities (tasks, comments, legal requirements, actions), you **must** include dashboard message data to trigger notifications.

**Pattern from [src/features/MessageCenterEventsList/EditEventDetailsDrawer.js](src/features/MessageCenterEventsList/EditEventDetailsDrawer.js)** (lines 665-698):

```javascript
// Required fields for dashboard_message table
formData.append('module_string', 'tasks'); // Module identifier
formData.append('module_table', 'logtask_comments'); // Source table
formData.append('date_message', new Date().toISOString().split('T')[0]); // YYYY-MM-DD
formData.append('created', new Date().toISOString().slice(0, 19).replace('T', ' ')); // YYYY-MM-DD HH:MM:SS

if (entity?.due_date) {
  formData.append('due_date', entity.due_date); // Optional deadline
}

// Bilingual messages (Spanish)
formData.append('employee_message_es', `Nuevo comentario colocado para la tarea #${taskId}`);
formData.append('subject_message_es', `${userName} ha puesto comentario para ${taskTitle}`);
formData.append('text_message_es', commentText.substring(0, 255)); // Preview (max 255 chars)
formData.append('long_text_message_es', ` ${commentText}`); // Full text

// Bilingual messages (English)
formData.append('employee_message_en', `New comment placed for task #${taskId}`);
formData.append('subject_message_en', `${userName} has put comment for ${taskTitle}`);
formData.append('text_message_en', commentText.substring(0, 255));
formData.append('long_text_message_en', ` ${commentText}`);

// Recipients and sender (backend resolves names/emails from IDs)
formData.append('user_ids', '1'); // Comma-separated recipient IDs
formData.append('who_sent_id', userData.id_administradores); // Sender ID

// Status and metadata
formData.append('status', 'pending'); // 'pending', 'read', 'archived'
formData.append('created_by', userData.id_administradores);
```

**After creating dashboard message, dispatch global event**:
```javascript
if (response.data.status) {
  // Trigger unread count refresh across all components
  window.dispatchEvent(new CustomEvent('dashboard-message-created'));
}
```

**Listening for dashboard message events** - Use in header/layout components:
```javascript
useEffect(() => {
  const handleMessageCreated = () => {
    dispatch(fetchUnreadMessagesCount('1'));
  };
  window.addEventListener('dashboard-message-created', handleMessageCreated);
  return () => window.removeEventListener('dashboard-message-created', handleMessageCreated);
}, [dispatch]);
```

**Module String Values**: `'tasks'`, `'LegalMatriz'`, `'actions'`, `'findings'`, `'inspections'`, `'events'`

**See also**: [src/services/legalService.js](src/services/legalService.js) lines 48-80 for legal requirement message example.

## Configuration Management

### Multi-Environment Config

**Runtime Configs**: `public/config.development.json`, `public/config.production.json`, `public/config.json`. The active config is determined at runtime, not build time.

**Build Process**: `npm run build` copies configs to build folder via [scripts/copy-config.js](scripts/copy-config.js).

**Module Permissions**: Subdomain-based feature visibility configured in [src/config/modulesConfig.js](src/config/modulesConfig.js). Different subdomains show/hide modules like `events`, `notifications`.

### Path Aliases

Use `@/` for imports: `import Component from '@/components/Component'` (configured in [jsconfig.json](jsconfig.json)).

## Development Workflows

### Commands
- `npm start` - Start dev server on port 3000
- `npm run build` - Production build + config copy (runs `react-scripts build` then `copy-config` script)
- `npm run copy-config` - Copy config files to build directory (via [scripts/copy-config.js](scripts/copy-config.js))
- `npm test` - Run tests in interactive watch mode
- `npm run eject` - Eject from Create React App (one-way operation)
- `postinstall` - Automatically copies PDF.js worker from node_modules to public folder after `npm install`

### Linting
ESLint config in [eslint.config.js](eslint.config.js) enforces:
- Import ordering with `import/order` rule (groups: builtin, external, internal, parent, sibling)
- Alphabetized imports within groups (`alphabetize: { order: 'asc', caseInsensitive: true }`)
- No prop-types (disabled - relies on runtime validation)
- Unix line endings (`linebreak-style: unix`)
- Restricted deep feature imports: `@/features/*/*` forbidden (prevents cross-feature coupling)
- React imports not required in JSX scope (`react/react-in-jsx-scope: off`)
- Exhaustive deps warnings disabled for hooks (`react-hooks/exhaustive-deps: off`)

### Package Management
- This project uses **npm** (not pnpm or yarn) - `pnpm-lock.yaml` exists but npm is the standard
- Key dependencies: React 18.2.0, Redux Toolkit 2.1.0, MUI 5.14.7, Axios 1.13.2
- PDF.js worker auto-copied to `public/static/js/` via postinstall script

### Styling
- Primary: Material-UI components with custom theme
- Utility classes: Tailwind (configured in [tailwind.config.js](tailwind.config.js))
- Custom CSS only for component-specific styles (e.g., [MessageCenterActionViewTable.css](src/features/MessageCenterActionViewTable.css), [BaseTab.css](src/components/BaseTab.css))
- Avoid inline styles except for dynamic values

## Critical Patterns

**Lazy Loading**: Routes use `React.lazy` for code splitting - see [src/routes/RoutesFile.js](src/routes/RoutesFile.js):
```javascript
const MessageCenterEvents = lazy(() => import('../features/MessageCenterEvents'));
```

**Polling Pattern**: [src/components/TheLayout.js](src/components/TheLayout.js) implements 5-minute polling for new messages using custom `usePageVisibility` hook ([src/hooks/usePageVisibility.js](src/hooks/usePageVisibility.js)).

**Event-Driven Updates**: Real-time message counter updates use custom events via `window.dispatchEvent(new CustomEvent('dashboard-message-created'))` and [src/hooks/useMessageCreatedListener.js](src/hooks/useMessageCreatedListener.js) for cross-component communication without prop drilling.

**Custom Hooks**: Common hooks in [src/hooks/](src/hooks/):
- `usePageVisibility.js` - Detects if page is visible/hidden for efficient polling
- `useUnreadMessagesPolling.js` - Manages unread message polling logic
- `useModuleNavigation.js` - Handles navigation between modules
- `useModuleData.js` - Fetches and manages module-specific data
- `useCascadingFilters.js` - Manages dependent filter selections
- `useMessageCreatedListener.js` - Listens for custom browser events to update message counts
- `useInterSectionObserver.js` - Detects element visibility for infinite scrolling

**Form Handling**: Forms use `BaseFormControl` wrapper (see [src/components/BaseFormControl.js](src/components/BaseFormControl.js)) for consistent error display.

**Nested Drawer Pattern**: Complex features use multi-level drawer navigation (see [src/features/MessageCenterLegalMatriz/OptionsDrawer.js](src/features/MessageCenterLegalMatriz/OptionsDrawer.js)):
```javascript
// Parent drawer with tabs containing sub-features
<OptionsDrawer
  openOptionsDrawer={open}
  onCloseOptionsDrawer={() => setOpen(false)}
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  optinDrawerData={rowData} // Pass context data to all tabs
  Title="Legal Requirement Options"
/>
```
Each tab (Details, Analysis, Articles, Compliance) receives shared state via props (`optinDrawerData`, `complianceData`, `setCompliancedata`). This allows workflow steps to pass data between tabs without Redux. Used in legal matrix and event detail views.

**FormBuilder Component**: Dynamic form generation via [src/components/FormBuilder.js](src/components/FormBuilder.js). Pass field configs with `inputFields` prop:
```javascript
const formFields = [
  { id: 'comment', label: t('comment'), type: 'textarea', defaultValue: '', required: true },
  { id: 'type', label: t('add_comment_like'), type: 'dropdown', options: typeOptions },
  { id: 'progress', label: t('progress'), type: 'progress', defaultValue: 0, disabled: progress === 100 }
];

<FormBuilder
  inputFields={formFields}
  controlled={true}
  initialValues={formValues}
  onChange={(id, value) => setFormValues(prev => ({ ...prev, [id]: value }))}
  showActionButton={false}
/>
```
Supported field types: `text`, `textarea`, `dropdown`, `radio`, `date`, `datetime`, `signature`, `autocomplete`, `file`, `switch`, `checkbox`, `progress`.

**Utility Functions**: Common helpers in [src/utils/](src/utils/):
- `storage.js` - Token management for authentication
- `dateTimeFunctions.js` - Date formatting with dayjs
- `others.js` - Toast notifications (`showSuccessMsg`, `showErrorMsg`)

**Service Layer Pattern**: API logic encapsulated in services under [src/services/](src/services/):
- `legalService.js` - Legal requirement CRUD operations with dashboard message integration
- `treeStructureService.js` - Hierarchical data fetching for JSTree components
- Services handle FormData construction and error handling, returning clean data to components

## When Adding Features

1. Create feature folder under [src/features/](src/features/) with descriptive prefix
2. Add Redux slices to appropriate [src/stores/](src/stores/) subdirectory
3. Register slices in [src/store.js](src/store.js)
4. Add routes to [src/routes/RoutesFile.js](src/routes/RoutesFile.js) with lazy loading
5. Update filter configs in [src/config/filterConfig.js](src/config/filterConfig.js) if filterable
6. Use `BaseFilter`, `BaseSortPopper` for list views
7. All text must go through `t()` from `useTranslation()` hook
8. **Include dashboard message data** when creating/updating entities to trigger notifications (see Dashboard Message System section above)

## Common Pitfalls & Debugging

### API Issues
- **CORS errors in dev**: Check [src/setupProxy.js](src/setupProxy.js) proxy config - ensure target URL matches `REACT_APP_API_URL` in `.env`
- **401/403 errors**: Verify `LOCAL_AUTH_TOKEN` in [src/config/constants.js](src/config/constants.js) for dev, or check `storage.getToken()` in production
- **FormData not sending**: Always append to `FormData` instance, never create plain objects for POST requests to `_amatia_express` endpoints

### State Management
- **Stale data after mutations**: Dispatch `window.dispatchEvent(new CustomEvent('dashboard-message-created'))` after writes to refresh counters
- **Filter not working**: Ensure filter config exists in [src/config/filterConfig.js](src/config/filterConfig.js) with matching module name
- **Infinite loops in useEffect**: Check dependency arrays - `react-hooks/exhaustive-deps` is disabled, so be explicit

- **Nested drawer state loss**: When using nested drawers with tabs, lift activeTab state to parent component to preserve tab selection across drawer reopening
- **Shared state between tabs**: Pass data via props (`setCompliancedata`, `optinDrawerData`) rather than Redux for workflow-specific state that doesn't need global persistence
### Internationalization
- **Missing translations**: All user-facing text must use `t('key')` from `useTranslation()` hook
- **Wrong language displayed**: Check language toggle in header - default is Spanish (`es`), English available via `en`
- **Translation keys**: Defined in i18n config ([src/lib/i18n.js](src/lib/i18n.js)) - use snake_case for keys

### Build & Deploy
- **Config not updating after build**: Run `npm run copy-config` to sync `public/config.*.json` to `build/` folder
- **Runtime config errors**: Check browser console for "Runtime configuration loaded" message on app start
- **Missing PDF worker**: Postinstall script should copy `pdf.worker.min.mjs` to `public/static/js/` - re-run `npm install` if missing

### Component Issues
- **Drawer not closing**: Ensure `onClose` prop calls state setter to toggle `open` prop (e.g., `onClose={() => setOpen(false)}`)
- **Tab switching broken**: Tab `value` must match one of the Tab component `value` props exactly (string comparison)
- **FormBuilder fields not updating**: Use `controlled={true}` and pass `initialValues` + `onChange` for controlled behavior
