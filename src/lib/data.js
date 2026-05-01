import { Cached, Check, FastForward, RemoveCircle, WatchLater } from '@mui/icons-material';

export const statusColorObject = {
  not_apply:           '#E8E9EB',
  completed:           '#769656',
  in_progress:         '#6F86B3',
  under_progress:      '#6F86B3',
  partially_completed: '#6F86B3',
  delayed:             '#B86672',
  not_completed:       '#B86672',
  in_transition:       '#C4B46E'
};

export const statusIconObject = {
  not_apply: <RemoveCircle />,
  completed: <Check />,
  in_progress: <Cached />,
  under_progress: <Cached />,
  partially_completed: <Cached />,
  delayed: <WatchLater />,
  not_completed: <WatchLater />,
  in_transition: <FastForward />
};

export const subTotal = {
  not_apply: '', //grey
  completed: 100, //green
  in_progress: 50, //blue
  under_progress: 50, //blue
  partially_completed: 50, //blue
  delayed: 0, //red
  not_completed: 0, //red
  in_transition: '' //yellow
};
