import { useEffect, useState } from 'react';
import { IEvent, MetaData } from '@/interfaces/interfaceListEvent';
import { deleteEvent, getScannerEvent, uploadEvent } from '@/services/ListEventAPI';
import AvailabilityButton from './Button';
import Modal from '../Modal';
import { AUTO_REFRESH_TIME, EVENT_PAGE_QUOTE } from '@/constants';
import { notifications } from '@mantine/notifications';
import { CircleCheck, CircleX } from 'tabler-icons-react';
import Pagination from '../Pagination';
import { NoData } from '@/components';
import { LoadingOverlay } from '@mantine/core';
import CustomeLoader from '@/assets/icons/CustomeLoader';
import { useLoading } from '@/LoadingContext';
import { forkJoin } from 'rxjs';
import { getAutoRefresh } from '@/services/HeaderAPI';
import ScannerTable from './ScannerTable';
import ScannerPanel from './Panel';

interface EventProps {
  // metaData: MetaData;
  reloadFlag: number;
}

export interface IScannerEventData {
  id: string;
  bandwidth: string;
  elevation: string;
  azimuth: string;
  signalNum: string;
  signalId: string;
  setNum: string;
  centerFreq: string;
  signalPower: string;
  signalClass: string;
  timestamp: string;
}

const InitEventData: IScannerEventData[] = [
  {
    id: '',
    bandwidth: '-',
    elevation: '-',
    azimuth: '-',
    signalNum: '-',
    signalId: '-',
    setNum: '-',
    centerFreq: '-',
    signalPower: '-',
    signalClass: '-',
    timestamp: '-',
  },
];

const ScannerEvent = (props: EventProps) => {
  const { reloadFlag } = props;
  const { loading, setLoading } = useLoading();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentPageSize, setCurrentPageSize] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [order, setOrder] = useState<string>('desc');
  const [eventData, setEventData] = useState<IScannerEventData[]>(InitEventData);

  const [apiLoaded, setApiLoaded] = useState<boolean>(false);
  const [searchFlag, setSearchFlag] = useState<boolean>(false);
  const [removeFlag, setRemoveFlag] = useState<boolean>(false);
  const [listEvent, setListEvent] = useState<string[]>(['']);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [buttonType, setButtonType] = useState<string | null>(null);
  const [modalLoad, setModalLoad] = useState<boolean>(false);

  const getEventData = () => {
    const eventParams: IEvent = {
      page: currentPage,
      limit: currentPageSize,
      startDate: startDate ? startDate.toISOString() : '',
      endDate: endDate ? endDate.toISOString() : '',
      status: status ? status : '',
      order: order,
    };

    setLoading(true);
    setApiLoaded(false);

    const scannerEventObservable = getScannerEvent(eventParams);

    forkJoin([scannerEventObservable]).subscribe({
      next: ([scannerEventResponse]) => {
        setEventData(scannerEventResponse?.data?.events);
        setTotalPages(scannerEventResponse?.data?.meta?.totalPages);
        setApiLoaded(true);
        setLoading(false); // Set loading to false after both requests complete
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        setApiLoaded(true);
        setLoading(false); // Set loading to false in case of an error
      },
    });
  };

  // reload when search, change page, upload
  useEffect(() => {
    reloadFlag === 3 && getEventData();
  }, [currentPage, currentPageSize, searchFlag, order, reloadFlag, modalLoad]);

  // auto refresh
  useEffect(() => {
    if (reloadFlag === 3) {
      const interval = setInterval(() => {
        getAutoRefresh().subscribe({
          next: ({ data }) => {
            data && getEventData();
            !data &&
              notifications.show({
                icon: <CircleX size="1rem" color="red" />,
                autoClose: 3500,
                color: 'red',
                title: 'Maintaining',
                message: 'Auto refresh is off',
              });
          },
          error(err) {
            console.log(err);
          },
        });
      }, AUTO_REFRESH_TIME * 1000);

      document.addEventListener('refreshClick', getEventData);

      return () => {
        clearInterval(interval);
        document.removeEventListener('refreshClick', getEventData);
      };
    }
  }, [reloadFlag]);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const handleModal = (isOpen: boolean, typeButton: string | null) => {
    if (isOpen) {
      switch (typeButton) {
        case 'upload':
          return (
            <Modal
              onClose={toggle}
              typeBt={typeButton}
              isOpen={isOpen}
              header={EVENT_PAGE_QUOTE.WARNING}
              caption={EVENT_PAGE_QUOTE.NOTICED_UPLOAD}
              listButton={[
                {
                  title: EVENT_PAGE_QUOTE.BUTTON_UPLOAD,
                  onPress: (e: any) => {
                    uploadEvent(e).subscribe({
                      next: (response: any) => {
                        response.data.status === 'success'
                          ? notifications.show({
                              icon: <CircleCheck size="1rem" color="green" />,
                              autoClose: 2000,
                              color: 'green',
                              title: 'File Import Successful',
                              message: response.data.message,
                            })
                          : notifications.show({
                              icon: <CircleX size="1rem" color="red" />,
                              autoClose: 3000,
                              color: 'red',
                              title: 'Import File Unsuccessful',
                              message: response.data.message,
                            });
                        // getEventAPI();
                        setModalLoad(!modalLoad);
                      },
                      error: (err) => {
                        err.status === 'error' &&
                          notifications.show({
                            icon: <CircleX size="1rem" color="red" />,
                            autoClose: 3000,
                            color: 'red',
                            title: 'Import File Unsuccessful',
                            message: err.message,
                          });
                      },
                    });
                    toggle();
                  },
                  buttonType: 'upload',
                },
                { title: EVENT_PAGE_QUOTE.BUTTON_CANCEL, onPress: toggle, buttonType: 'cancel' },
              ]}
            ></Modal>
          );
        // case 'startstop':
        //   return (
        //     <Modal
        //       onClose={toggle}
        //       typeBt={typeButton}
        //       isOpen={isOpen}
        //       header={EVENT_PAGE_QUOTE.WARNING}
        //       caption={status ? EVENT_PAGE_QUOTE.NOTICED_START : EVENT_PAGE_QUOTE.NOTICED_STOP}
        //       listButton={[
        //         {
        //           title: EVENT_PAGE_QUOTE.BUTTON_CONTINUE,
        //           onPress: () => {
        //             changeGeneratorStatus();
        //             setStatus(!status);
        //             toggle();
        //           },
        //           buttonType: 'continue',
        //         },
        //         {
        //           title: EVENT_PAGE_QUOTE.BUTTON_CANCEL,
        //           onPress: () => {
        //             toggle();
        //           },
        //           buttonType: 'cancel',
        //         },
        //       ]}
        //     ></Modal>
        //   );
        case 'clear':
          return (
            <Modal
              onClose={toggle}
              typeBt={typeButton}
              isOpen={isOpen}
              header={EVENT_PAGE_QUOTE.WARNING}
              caption={EVENT_PAGE_QUOTE.NOTICED_CLEAR_DATA}
              listButton={[
                {
                  title: EVENT_PAGE_QUOTE.BUTTON_CONTINUE,
                  onPress: () => {
                    deleteEvent(3, 'true');
                    toggle();
                    setModalLoad(!modalLoad);
                    // getEventAPI();
                  },
                  buttonType: 'continue',
                },
                {
                  title: EVENT_PAGE_QUOTE.BUTTON_CANCEL,
                  onPress: () => {
                    toggle();
                  },
                  buttonType: 'cancel',
                },
              ]}
            ></Modal>
          );

        default:
          return null;
      }
    }
  };
  return (
    <>
      {handleModal(isOpen, buttonType)}
      <ScannerPanel
        startDate={startDate}
        endDate={endDate}
        setEndDate={setEndDate}
        setStartDate={setStartDate}
        setStatus={setStatus}
        removeFlag={removeFlag}
      />
      <AvailabilityButton
        removeFlag={removeFlag}
        setRemoveFlag={setRemoveFlag}
        searchFlag={searchFlag}
        setSearchFlag={setSearchFlag}
        setCurrentPageSize={setCurrentPageSize}
        setCurrentPage={setCurrentPage}
        listEvent={listEvent}
        setButtontype={setButtonType}
        setIsOpen={setIsOpen}
      />
      <ScannerTable
        currentPage={currentPage}
        eventData={eventData}
        setOrder={setOrder}
        setListEvent={setListEvent}
      />
      {eventData.length > 0 ? (
        <Pagination
          totalPage={totalPages}
          currentPage={currentPage}
          setCurrentPage={(value) => setCurrentPage(value)}
        />
      ) : (
        apiLoaded && <NoData />
      )}
      <LoadingOverlay visible={loading} overlayBlur={2} sx={{ position: 'fixed' }} />
      <LoadingOverlay
        visible={loading}
        loader={<CustomeLoader title="Data Importing..." />}
        overlayBlur={2}
        sx={{ position: 'fixed' }}
      />
    </>
  );
};

export default ScannerEvent;
