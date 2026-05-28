import React, { useState } from "react";
import { lashes, settingbg } from "../assets/res";
import { FaEye } from "react-icons/fa";
import { useSetting } from "../hooks/useSetting";
import { NotificationPreferences } from "../types/setting.types";

const Setting: React.FC = () => {
  const {
    fileInputRef,
    handlePhotoUpload,
    triggerFileInput,
    handleChange,
    passwordError,
    // isTransactionEmailChecked,
    // isCustomerReceiptChecked,
    formData,
    isEditable,
    handleSave,
    handleEdit,
    handleStepChange,
    activeStep,
    newPasswordVisible,
    toggleNewPasswordVisibility,
    // toggleTransactionEmail,
    // toggleCustomerReceipt,
    // toggleCashierNotification,
    isCashierNotificationChecked,
    // isNotificationsEnabled,
    // toggleNotifications,
    passwordVisible,
    togglePasswordVisibility,
    isModified,
    loading,
    imageLoading,
    updatePassword,
    editPassword,
    toggleEditPassword,
    confirmPasswordVisible,
    toggleConfirmPasswordVisible,
    notificationIsModified,
    updateNotifications,
    toggleAllNotifications,
    areAllNotificationsEnabled,
    notificationPreferences,
    handleCheckboxChange,
    notificationOptions
  } = useSetting();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); //

  // const { updatePassword, loading, error, success } = useUpdatePassword();
  const handlePasswordChange = async () => {
    if (oldPassword && newPassword && newPassword === confirmPassword) {
      await updatePassword(oldPassword, newPassword);
    }
  };

  return (
    <div className="font-inter">
      <div className="relative">
        <img src={settingbg} alt="Background" className="w-full" />
      </div>

      {/* Steps Navigation */}
      <div className="flex gap-10 ustify-between pb-4 mx-10 mt-16 ">
        <button
          onClick={() => handleStepChange("business")}
          className={`relative text-base  pb-2 ${
            activeStep === "business" ? "" : "text-grey"
          }`}
        >
          Business Settings
          {activeStep === "business" ? (
            <span className="absolute bottom-0 mt-2 left-0 w-full h-1 bg-pry"></span>
          ) : (
            <span className="absolute bottom-0 mt-2 left-0 w-full h-1 bg-white"></span>
          )}
        </button>
        <button
          onClick={() => handleStepChange("notification")}
          className={`relative text-base  pb-2 ${
            activeStep === "notification" ? "" : "text-grey"
          }`}
        >
          Notifications
          {activeStep === "notification" ? (
            <span className="absolute bottom-0 mt-2 left-0 w-full h-1 bg-pry"></span>
          ) : (
            <span className="absolute bottom-0 mt-2 left-0 w-full h-1 bg-white"></span>
          )}
        </button>
        {/* <button
          onClick={() => handleStepChange("roles")}
          className={`relative text-base  pb-2 ${
            activeStep === "roles" ? "" : "text-grey"
          }`}
        >
          Roles & Permissions
          {activeStep === "roles" ? (
            <span className="absolute bottom-0 mt-2 left-0 w-full h-1 bg-pry"></span>
          ) : (
            <span className="absolute bottom-0 mt-2 left-0 w-full h-1 bg-white"></span>
          )}
        </button> */}
      </div>

      {/* Step Content */}
      <div className="py-10 bg-white mx-3 rounded-2xl px-8">
        {activeStep === "business" && (
          <div className=" ">
            <form className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-[22%] py-4 ">
                  <h3 className="font-bold text-lg mb-2">Business Profile</h3>
                  <p className="text-xs ">
                    Changes made to your name would <br /> be visible to others
                    on the team.
                  </p>
                </div>
                <div className="w-[55%]  p-4 ">
                  {/* Business Name and Address */}
                  <div className="flex flex-col mb-4 md:flex-row gap-6">
                    <div className="flex-1">
                      <label
                        htmlFor="businessName"
                        className="block text-sm font-medium text-input"
                      >
                        Business Name
                      </label>
                      <input
                        type="text"
                        id="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        readOnly={!isEditable}
                        className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          isEditable ? "bg-fade" : "bg-bginput "
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="emailAddress"
                        className="block text-sm font-medium text-input"
                      >
                        Business Email Address
                      </label>
                      <input
                        type="email"
                        id="emailAddress"
                        disabled
                        value={formData.emailAddress}
                        className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none  bg-slate-100`}
                      />
                    </div>
                  </div>

                  {/* Phone Number and Business Address */}
                  <div className="flex flex-col mb-4 md:flex-row gap-6">
                    <div className="flex-1">
                      <label
                        htmlFor="phoneNumber"
                        className="block text-sm font-medium text-input"
                      >
                        Business Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        readOnly={!isEditable}
                        className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          isEditable ? "bg-fade" : "bg-bginput"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="businessAddress"
                        className="block text-sm font-medium text-input"
                      >
                        Business Address
                      </label>
                      <input
                        type="text"
                        id="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleChange}
                        readOnly={!isEditable}
                        className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          isEditable ? "bg-fade" : "bg-bginput"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Supporting Email Address and Phone Number */}
                  <div className="flex flex-col mb-4 md:flex-row gap-6">
                    <div className="flex-1">
                      <label
                        htmlFor="supportingEmail"
                        className="block text-sm font-medium text-input"
                      >
                        Supporting Email Address
                      </label>
                      <input
                        type="email"
                        id="supportingEmail"
                        value={formData.supportingEmail}
                        onChange={handleChange}
                        readOnly={!isEditable}
                        className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          isEditable ? "bg-fade" : "bg-bginput "
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="supportingPhone"
                        className="block text-sm font-medium text-input"
                      >
                        Supporting Phone Number
                      </label>
                      <input
                        type="tel"
                        id="supportingPhone"
                        value={formData.supportingPhone}
                        onChange={handleChange}
                        readOnly={!isEditable}
                        className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          isEditable ? "bg-fade" : "bg-bginput "
                        }`}
                      />
                    </div>
                  </div>

                  {/* State and LGA */}
                  <div className="flex flex-col mb-4 md:flex-row gap-6">
                    <div className="flex-1">
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-input"
                      >
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        placeholder="Enter here"
                        value={formData.state}
                        onChange={handleChange}
                        readOnly={!isEditable}
                        className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          isEditable ? "bg-fade" : "bg-bginput "
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="lga"
                        className="block text-sm font-medium text-input"
                      >
                        LGA
                      </label>
                      <input
                        id="lga"
                        placeholder="Enter here"
                        value={formData.lga}
                        onChange={handleChange}
                        readOnly={!isEditable}
                        className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          isEditable ? "bg-fade" : "bg-bginput"
                        }`}
                      />
                    </div>
                    {/* Business Description */}
<div className="flex flex-col mb-4 md:flex-row gap-6">
 
</div>


                  </div>
                   <div className="flex-1">
    <label
      htmlFor="description"
      className="block text-sm font-medium text-input"
    >
      Business Description
    </label>
    <textarea
      id="description"
      value={formData.description}
      onChange={handleChange}
      readOnly={!isEditable}
      placeholder="Write a short description about your business"
      className={`mt-1 block text-sm w-full px-4 py-2 h-[100px] border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
        isEditable ? "bg-fade" : "bg-bginput"
      }`}
    />
  </div>
                  <div className="flex justify-end gap-5 mt-6">
                    {!isEditable ? (
                      <button
                        type="button"
                        onClick={handleEdit}
                        className="px-4 py-2 bg-orange-300 hover:bg-pry text-white rounded-md shadow-sm"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleEdit}
                          className={`px-4 py-2 text-orange-300  border-pry border ${isEditable} rounded-md shadow-sm cursor-pointer`}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          className={`px-4 py-2 text-orange-300  border-pry border ${isEditable} ${
                            !isModified
                              ? "cursor-not-allowed"
                              : "cursor-pointer"
                          } rounded-md shadow-sm hover`}
                          disabled={!isModified || loading}
                        >
                          {loading ? "Saving Changes..." : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-[25%] p-4">
                  {/* Profile Photo */}
                  <div className="flex flex-col items-center mb-6">
                    {/* Profile Photo */}
                    <img
                      src={formData.profilePhoto}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover shadow-md"
                    />

                    {/* Hidden File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      id="profilePhoto"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />

                    {/* Upload Business Logo Text */}
                    <p className="text-xs text-pry mb-4 justify-center text-center mt-2">
                      Upload Business Logo
                    </p>

                    {/* Upload Photo Button */}
                    <p
                      onClick={() => {
                        if (!imageLoading) {
                          triggerFileInput();
                        }
                      }}
                      className={`px-4 py-2 rounded-sm w-fit mx-auto text-center transition-all ${
                        imageLoading
                          ? "bg-gray-400 cursor-not-allowed animate-pulse"
                          : "bg-fade hover:bg-fade-dark cursor-pointer"
                      }`}
                    >
                      {imageLoading ? "Uploading image..." : " Upload Photo"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="border-b h-1 w-full border-grey"></div>
                <div className="flex mt-5 gap-[2.5%]">
                  <div className="w-[22%]">
                    <p className="text-xs">Change Password</p>
                    <p className="text-xs pt-4">
                      Changing your password would automatically log you out,
                      and require you to login with your new password.
                    </p>
                  </div>
                  <div className="flex flex-col items-start w-[50%]">
                    <div className="mb-6 flex-1 relative">
                      <label
                        className="block text-sm font-medium text-input"
                        htmlFor="password"
                      >
                        Old Password
                      </label>
                      <div className="relative">
                        <input
                          type={passwordVisible ? "text" : "password"}
                          id="password"
                          placeholder="Enter here"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          readOnly={!editPassword}
                          className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            editPassword ? "bg-fade" : "bg-bginput "
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600"
                        >
                          {passwordVisible ? (
                            <FaEye size={20} />
                          ) : (
                            <img src={lashes} alt="Hide" />
                          )}
                        </button>
                      </div>
                      {passwordError && (
                        <p className="text-red-500 text-sm mt-1">
                          {passwordError}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* <> */}
                      {/* New Password Field */}
                      <div className="mb-6 flex-1 relative">
                        <label
                          className="block text-sm font-medium text-input"
                          htmlFor="newPassword"
                        >
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={newPasswordVisible ? "text" : "password"}
                            id="newPassword"
                            placeholder="Enter here"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            readOnly={!editPassword}
                            className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                              editPassword ? "bg-fade" : "bg-bginput "
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={toggleNewPasswordVisibility}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600"
                          >
                            {newPasswordVisible ? (
                              <FaEye size={20} />
                            ) : (
                              <img src={lashes} alt="Hide" />
                            )}
                          </button>
                        </div>
                        {/* {passwordError && (
                          <p className="text-red-500 text-sm mt-1">
                            {passwordError}
                          </p>
                        )} */}
                      </div>

                      {/* Confirm Password Field */}
                      <div className="mb-6 flex-1 relative">
                        <label
                          className="block text-sm font-medium text-input"
                          htmlFor="confirmPassword"
                        >
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={confirmPasswordVisible ? "text" : "password"}
                            id="confirmPassword"
                            placeholder="Enter here"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            readOnly={!editPassword}
                            className={`mt-1 block text-sm h-[40px] w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                              editPassword ? "bg-fade" : "bg-bginput"
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={toggleConfirmPasswordVisible}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600"
                          >
                            {confirmPasswordVisible ? (
                              <FaEye size={20} />
                            ) : (
                              <img src={lashes} alt="Hide" />
                            )}
                          </button>
                        </div>
                        {confirmPassword !== newPassword && (
                          <p className="text-red-500 text-sm mt-1">
                            Passwords do not match.
                          </p>
                        )}
                      </div>
                      {/* </> */}
                    </div>
                  </div>
                </div>
              </div>
              {/* Submit Button */}
              {/* Buttons */}
              <div className="flex justify-end mr-[26%] gap-5 mt-6">
                {!editPassword ? (
                  <button
                    type="button"
                    onClick={toggleEditPassword}
                    className="px-4 py-2 bg-orange-300 hover:bg-pry text-white rounded-md shadow-sm"
                  >
                    Change Password
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    className={`px-4 py-2 text-orange-300 border-pry border rounded-md shadow-sm ${
                      oldPassword &&
                      newPassword &&
                      confirmPassword === newPassword
                        ? ""
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={
                      !oldPassword ||
                      !newPassword ||
                      newPassword !== confirmPassword
                    }
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {activeStep === "notification" && (
          <div className="w-full mb-20">
            <div className="flex justify-between mb-3 items-center">
              <div className="flex gap-10  items-center space-x-3">
                <p className="text-sm">Allow All Notification Preferences</p>
                {/* Toggle Button */}
                <button
                  className={`relative w-8 h-4 rounded-full transition-colors duration-300 focus:outline-none ${
                    areAllNotificationsEnabled ? "bg-green-500" : "bg-gray-300"
                  }`}
                  onClick={toggleAllNotifications}
                >
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full bg-white transition-transform duration-300 ${
                      areAllNotificationsEnabled
                        ? "w-1/2 translate-x-full"
                        : "w-1/2"
                    }`}
                  ></div>
                </button>
              </div>

              { notificationIsModified && <button
                type="button"
                onClick={updateNotifications}
                className="px-4 py-2 bg-orange-300 hover:bg-pry text-white rounded-md shadow-sm"
              >
                {loading?"Saving...":"Save"}
              </button>}
            </div>
            <div className="border-b mb-5 h-1 w-full border-grey"></div>
            <p className="text-sm">Notification Preferences </p>
            <div className="flex justify-between flex-wrap">
              {/* Transaction Email Toggle */}
              {/* <div className="mt-3 items-center justify-center flex gap-3">
                <button
                  onClick={toggleTransactionEmail}
                  className={`flex items-center justify-center w-4 h-4 rounded-full border-2 transition-all duration-300 focus:outline-none ${
                    isTransactionEmailChecked
                      ? "bg-orange-500 border-orange-500"
                      : "bg-white border-gray-400"
                  }`}
                  aria-pressed={isTransactionEmailChecked} // For accessibility
                >
                  {isTransactionEmailChecked && (
                    <span className="text-white text-xs font-bold">✔</span>
                  )}
                </button>
                <div>
                  <p className="text-sm">Transactions Email</p>
                  <p className="text-xs">Notify me for every transaction</p>
                </div>
              </div> */}

              {/* Customer Receipt Toggle */}
              {/* <div className="mt-3 items-center justify-center flex gap-3">
                <button
                  onClick={toggleCustomerReceipt}
                  className={`flex items-center justify-center w-4 h-4 rounded-full border-2 transition-all duration-300 focus:outline-none ${
                    isCustomerReceiptChecked
                      ? "bg-orange-500 border-orange-500"
                      : "bg-white border-gray-400"
                  }`}
                  aria-pressed={isCustomerReceiptChecked} // For accessibility
                >
                  {isCustomerReceiptChecked && (
                    <span className="text-white text-xs font-bold">✔</span>
                  )}
                </button>
                <div>
                  <p className="text-sm">Customers Receipt</p>
                  <p className="text-xs">
                    Send receipt to customer after every transaction
                  </p>
                </div>
              </div> */}

              {/* Cashier Notification Toggle */}
              {/* <div
                className="mt-3 items-center justify-center flex gap-3 cursor-pointer"
                onClick={toggleCashierNotification}
              >
                <button
                  className={`flex items-center justify-center w-4 h-4 rounded-full border-2 transition-all duration-300 focus:outline-none ${
                    isCashierNotificationChecked
                      ? "bg-orange-500 border-orange-500"
                      : "bg-white border-gray-400"
                  }`}
                  aria-pressed={isCashierNotificationChecked} // For accessibility
                >
                  {isCashierNotificationChecked && (
                    <span className="text-white text-xs font-bold">✔</span>
                  )}
                </button>
                <div>
                  <p className="text-sm">Enable Cashier Notification</p>
                  <p className="text-xs">
                    Cashier receives notification for all processed orders
                  </p>
                </div>
              </div> */}
              {Object.entries(notificationOptions).map(([key, { label, description }]) => (
                <div
                key={key}
                className="mt-3 items-center w-[30%] justify-start flex gap-3 cursor-pointer"
                onClick={() => handleCheckboxChange(key as keyof NotificationPreferences)}
              >
                <button
                  className={`flex items-center justify-center w-4 h-4 rounded-full border-2 transition-all duration-300 focus:outline-none ${
                    notificationPreferences[key as keyof NotificationPreferences]
                      ? "bg-orange-500 border-orange-500"
                      : "bg-white border-gray-400"
                  }`}
                  aria-pressed={isCashierNotificationChecked} // For accessibility
                >
                  {notificationPreferences[key as keyof NotificationPreferences] && (
                    <span className="text-white text-xs font-bold">✔</span>
                  )}
                </button>
                <div>
                  <p className="text-sm">{label}</p>
                  <p className="text-xs">
                    {description}
                  </p>
                </div>
              </div>
          // <div key={key} className="flex items-start space-x-3 bg-gray-100 p-3 rounded-lg">
          //   <input
          //     type="checkbox"
          //     checked={notificationPreferences[key as keyof NotificationPreferences]}
          //     onChange={() => handleCheckboxChange(key as keyof NotificationPreferences)}
          //     className="form-checkbox h-5 w-5 text-blue-600 mt-1"
          //   />
          //   <div>
              
          //     <label className="font-semibold text-gray-800">{label}</label>
          //     <p className="text-gray-600 text-sm">{description}</p>
          //   </div>
          // </div>
        ))}
            </div>
          </div>
        )}

        {activeStep === "roles" && (
          <div>
            <h2 className="text-sm mb-6">Roles & Permissions</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Setting;
