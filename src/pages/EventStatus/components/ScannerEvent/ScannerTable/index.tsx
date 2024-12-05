import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Table, Checkbox, createStyles, rem, ScrollArea, Text } from '@mantine/core';
import { BiUpArrow, BiDownArrow } from 'react-icons/bi';
import moment from 'moment';
import { IScannerEventData } from '..';
interface ScannerProps {
  currentPage: number;
  setListEvent: Dispatch<SetStateAction<string[]>>;
  setOrder: Dispatch<SetStateAction<string>>;
  eventData: IScannerEventData[];
}

const useStyles = createStyles((theme) => ({
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.colors.gray[6],
    transition: 'box-shadow 150ms ease',

    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
    },
  },

  headerCell: {
    borderBottom: 'none',
  },

  text: {
    color: theme.white,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
    lineHeight: '20px',
  },

  row: {
    backgroundColor: theme.colors.gray[7],
  },

  cell: {
    borderBottom: `${rem(1)} solid ${theme.colors['white-alpha'][2]}`,
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}));

const ScannerTable = (props: ScannerProps) => {
  const { currentPage, setOrder, eventData, setListEvent } = props;
  const data = eventData;
  const [tickAll, setTickAll] = useState(false);
  const [subCheckBoxes, setSubCheckBoxes] = useState(Array(data.length).fill(false));
  const [isToggled, setIsToggled] = useState(true);
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);

  const handleToggle = () => {
    setIsToggled(!isToggled);
    if (isToggled) {
      setOrder('asc');
    } else {
      setOrder('desc');
    }
  };

  const handleTickAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setTickAll(isChecked);
    setSubCheckBoxes(Array(data.length).fill(isChecked));
    if (isChecked) {
      const allIds = data.map((items) => items.id);
      setListEvent(allIds);
    } else {
      setListEvent(['']);
    }
  };

  const handleSubCheckBox = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setSubCheckBoxes((prevState) => {
      const newCheckBoxes = [...prevState];
      newCheckBoxes[index] = isChecked;
      return newCheckBoxes;
    });
    setListEvent((prevListEvent) => {
      const updatedList = prevListEvent.filter(Boolean);
      if (isChecked) {
        return [...updatedList, data[index].id];
      } else {
        return updatedList.filter((id) => id !== data[index].id);
      }
    });
  };

  useEffect(() => {
    setTickAll(false);
    setSubCheckBoxes(Array(data.length).fill(false));
  }, [currentPage, eventData]);

  return (
    <ScrollArea.Autosize
      mah={'80vh'}
      sx={(theme) => ({
        borderRadius: '16px',
        padding: '16px',
        backgroundColor: theme.colors.gray[7],
      })}
      onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
    >
      <Table className={cx(classes.text)} verticalSpacing={'xs'}>
        <thead
          className={cx(classes.header, { [classes.scrolled]: scrolled })}
          style={{ zIndex: 1 }}
        >
          <tr>
            <th className={cx(classes.headerCell)}>
              <div style={{ display: 'flex' }}>
                <Checkbox
                  checked={tickAll}
                  onChange={handleTickAll}
                  style={{ marginRight: '5%' }}
                />
                발생 시간 &nbsp;
                <span>
                  {isToggled ? (
                    <BiDownArrow size={12} onClick={handleToggle} />
                  ) : (
                    <BiUpArrow size={12} onClick={handleToggle} />
                  )}
                </span>
              </div>
            </th>
            <th className={cx(classes.headerCell)}>Detected Signal Num</th>
            <th className={cx(classes.headerCell)}>Signal ID</th>
            <th className={cx(classes.headerCell)}>Detected Set Num</th>
            <th className={cx(classes.headerCell)}>Center-Freq (MHz)</th>
            <th className={cx(classes.headerCell)}>Bandwidth (MHz)</th>
            <th className={cx(classes.headerCell)}>Elevation (deg)</th>
            <th className={cx(classes.headerCell)}>Azimuth (deg)</th>
            <th className={cx(classes.headerCell)}>Signal Power (dB)</th>
            <th className={cx(classes.headerCell)}>Signal Class</th>
          </tr>
        </thead>
        <tbody>
          {data.map((items, index) => (
            <tr key={index} className={cx(classes.row)}>
              <td className={cx(classes.cell)}>
                <Checkbox
                  checked={subCheckBoxes[index]}
                  onChange={handleSubCheckBox(index)}
                  label={
                    <Text color="white">
                      {moment(items.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                    </Text>
                  }
                />
              </td>
              <td className={cx(classes.cell)}>{items.signalNum}</td>
              <td className={cx(classes.cell)}>{items.signalId}</td>
              <td className={cx(classes.cell)}>{items.setNum}</td>
              <td className={cx(classes.cell)}>{items.centerFreq}</td>
              <td className={cx(classes.cell)}>{items.bandwidth}</td>
              <td className={cx(classes.cell)}>{items.elevation}</td>
              <td className={cx(classes.cell)}>{items.azimuth}</td>
              <td className={cx(classes.cell)}>{items.signalPower}</td>
              <td className={cx(classes.cell)}>
                {items.signalClass == '0' ? '정상 신호' : '재밍신호'}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ScrollArea.Autosize>
  );
};
export default ScannerTable;
