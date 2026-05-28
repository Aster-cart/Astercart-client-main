import { IoNotificationsOutline } from "react-icons/io5";
import { calender, down, map, outline } from "../assets/res";
import { useAuthStore } from "../store/authStore";
import { useNotification } from "../hooks/useNotification";



const PageHeader: React.FC<{ title: string }> = ({ title }) => {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;
  const { storeProfile} = useAuthStore()
  const {
    notifications,
    showNotificationModal,
    toggleNotificationModal,
    markAsRead,
    markAllAsRead,
    formatToTodayTime,
    allRead,
    unreadCount,
  } = useNotification();

  return (
      <div className="sticky top-0 bg-white z-10">
        <div className="flex justify-between font-inter items-center w-full h-[60px] px-4 bg-white">
          <div className="flex items-center gap-3">
            <h1 className="text-lg md:text-2xl">{title}</h1>
            <span className="flex items-center text-sm px-3 md:px-4 py-1 md:py-2 rounded-3xl bg-[#FFF6F0] text-[#7B7B7B]">
              <img className="pr-2" src={calender} alt="" />
              {formattedDate}
            </span>
          </div>
          <div className="flex space-x-2 md:space-x-4">
            {/* <button className="w-full sm:w-[150px] md:w-[200px] my-auto px-4 py-2 flex border rounded-3xl text-gray-400 font-medium text-xs sm:text-sm border-gray-300">
              <div className="w-full flex items-center">
                <img className="pr-2" src={search} alt="search icon" />
                <span className="truncate">Search</span>
              </div>
            </button> */}
<div>
            <button
            onClick={toggleNotificationModal}
            className="relative bg-pry  rounded-full size-8 flex justify-center items-center">
              <IoNotificationsOutline className="text-lg md:text-xl text-white" />
              {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-[#FFEBB2] text-pry text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
            </button>
               {showNotificationModal && (
                      <div className="absolute top-12 right-20 z-50 font-inter bg-white shadow-lg rounded-lg p-4 w-[411px]">
                        <div className="flex justify-between mb-5 items-center gap-2 w-full">
                          <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-3">
                              <h3 className="text-sm leading-5 font-semibold my-auto">
                                Notifications
                              </h3>
                              <div className="flex items-center gap-2">
                                <p className=" text-sm text-[#9EA0AA]">
                                  {allRead ? "Read" : "Unread"}
                                </p>
                                <img src={down} alt="Unread icon" className="" />
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <p
                                onClick={markAllAsRead}
                                className="text-right text-sm cursor-pointer"
                              >
                                Mark all as read
                              </p>
                              <img onClick={markAllAsRead} src={outline} alt="Mark as read icon" className="" />
                            </div>
                          </div>
                        </div>
            
                        <ul className="flex flex-col gap-2">
                          {notifications.map((notif) => (
                            <li
                              key={notif.id}
                              className={`border-b border-gray-300 cursor-pointer ${
                                notif.read ? "text-gray-400" : "text-black"
                              }`}
                              onClick={() => markAsRead(notif.id)}
                            >
                              <div className="flex flex-row gap-3 px-0">
                                <div className="flex mx-5 flex-col">
                                  <div className="flex flex-col gap-3">
                                    <span className="text-sm leading-5">
                                      {notif.message.split(":")[0]}
                                    </span>
                                    {notif.message.includes(":") &&
                                      notif.message.split(":")[1] && (
                                        <span className="text-sm leading-5">
                                          {notif.message.split(":")[1]}
                                        </span>
                                      )}
                                  </div>
                                  {!notif.read && (
                                    <button className="text-xs text-left rounded-lg mb-2 text-white bg-pry mt-1 px-2 py-1 w-fit">
                                      View
                                    </button>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {formatToTodayTime(notif.timestamp)}
                                  </span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={toggleNotificationModal}
                          className="text-xs mt-2 text-red-500"
                        >
                          Close
                        </button>
                      </div>
                    )}
            </div>
            <div className="flex items-center border border-gray-300 rounded-3xl bg-[#F9FAFB] px-2 md:px-3">
              <div className="bg-fade p-1 rounded-full">
                <img
                  src={map}
                  alt="Map Icon"
                  className="w-4 md:w-5 h-4 md:h-5"
                />
              </div>
              <p className="px-1 md:px-2 bg-[#F9FAFB] text-[#434343]  text-sm leading-5 py-1 focus:outline-none">
                {storeProfile?.name}
              </p>
              {/* <select className="px-1 md:px-2 bg-[#F9FAFB] text-[#434343]  text-sm leading-5 py-1 focus:outline-none">
                <option>Shoprite Ikeja</option>
                <option>Supermarket 2</option>
                <option>Supermarket 3</option>
              </select> */}
            </div>
          </div>
        </div>
      </div>
  );
};

export default PageHeader;
