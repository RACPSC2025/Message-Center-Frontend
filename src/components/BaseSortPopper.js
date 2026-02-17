import CheckIcon from '@mui/icons-material/Check';
import SortIcon from '@mui/icons-material/Sort';
import {
  Box,
  ClickAwayListener,
  Divider,
  Grow,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popper
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const BaseSortPopper = ({
  sortOrderOptions,
  selectedSortOrder,
  handleSortOrderOptionClick
}) => {
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const isSortOpen = Boolean(sortAnchorEl);

  const { t } = useTranslation();

  const handleSortIconClick = (event) => {
    setSortAnchorEl(sortAnchorEl ? null : event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const selectedIconStyleAttrs = {
    position: 'absolute',
    left: 0,
    width: '30px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <>
      <IconButton onClick={handleSortIconClick}>
        <SortIcon />
      </IconButton>
      <Popper
        open={isSortOpen}
        anchorEl={sortAnchorEl}
        role={undefined}
        placement="bottom-end"
        transition
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            sx={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleSortClose}>
                <MenuList id="sort-menu-list-grow">
                  <MenuItem disabled sx={{ opacity: 1, fontWeight: 'bold', fontSize: '0.875rem' }}>
                    {t('sort_order')}
                  </MenuItem>
                  {sortOrderOptions.map((option) => (
                    <MenuItem
                      key={option}
                      onClick={() => handleSortOrderOptionClick(option)}
                      selected={selectedSortOrder === option}
                      sx={{ position: 'relative', pl: 3 }}
                    >
                      {selectedSortOrder === option ? (
                        <Box sx={selectedIconStyleAttrs}>
                          <CheckIcon fontSize="small" />
                        </Box>
                      ) : null}
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default BaseSortPopper;