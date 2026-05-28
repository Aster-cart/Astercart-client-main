import React from "react";
import {
  cloud,
  link,
  upload,
} from "../assets/res";
import { useInventoryModal } from "../hooks/useInventoryModal";

type ImportModalProps = {
    onClose: () => void;
    onImport: (data: any[]) => void;
  };
  const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport }) => {
    const {
      uploading,
      progress,
      remainingKB,
      secondsRemaining,
      fileName,
      fileInputKey,
      handleFileSelect,
      handleFileDrop,
      handleFileUpload,
      openFilePicker,
      fileInputRef,
      imageUrl,
      inputRef,
      handleUrlChange,
      handleImageClick,
    } = useInventoryModal(onClose, onImport);
  
    return (
      <div className="fixed font-inter inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg w-[30vw] relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-binput p-2 w-8 h-8 rounded-full flex items-center justify-center"
          >
            X
          </button>
          <p className="text-xl leading-6 font-medium mb-4">Import Inventory</p>
          <p className="text-xs text-gray-500 leading-4 mb-6">
            You can upload your inventory document here. Your inventory file will
            be spooled to create your stock list.
          </p>
          <div
            className={`border-dashed rounded-lg border-2 border-gray-300 p-6 text-center mb-4 h-32 flex flex-col justify-center items-center ${
              uploading ? "bg-fade bg-opacity-50" : ""
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleFileDrop(e)}
          >
            {!uploading && (
              <label
                htmlFor="fileInput"
                className="cursor-pointer flex flex-col items-center"
              >
                <img src={upload} alt="Upload" className="mb-3" />
                <p className="leading-3 text-xs pb-3 font-medium">
                  Drop your document here or{" "}
                  <span className="text-pry">browse file</span>
                </p>
                <p className="leading-3 text-xs text-gray-500">
                  Supported: CSV, PDF, XLS, DOCS, DOCX
                </p>
              </label>
            )}
            <input
              key={fileInputKey}
              type="file"
              id="fileInput"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf, .xls, .xlsx, .doc, .docx, .csv"
            />
            {uploading && (
              <div className="w-full">
                <p className="text-sm mb-2 font-medium">{fileName}</p>
                <div className="relative w-full bg-fade rounded h-2 mb-2">
                  <div
                    className="absolute top-0 left-0 h-full bg-orange-500 rounded"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  Uploading... {remainingKB} KB remaining, {secondsRemaining}{" "}
                  seconds left
                </p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative flex flex-col justify-between border-dashed rounded-lg border-2 border-gray-300 p-4 text-center h-24 items-center">
              <input
                ref={inputRef}
                type="url"
                placeholder="Enter image URL"
                className="w-full text-transparent placeholder-transparent bg-center bg-no-repeat bg-cover border-none cursor-pointer"
                style={{
                  backgroundImage: `url(${
                    imageUrl || "default-image-placeholder-url"
                  })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                onChange={handleUrlChange}
              />
              {!imageUrl && (
                <div
                  onClick={handleImageClick}
                  className="absolute inset-0 flex justify-center items-center cursor-pointer"
                >
                  <img src={link} alt="Click to upload from URL" />
                </div>
              )}
              <p className="text-xs font-medium mt-2 text-center">Form URL</p>
            </div>
            <div className="border-dashed rounded-lg border-2 border-gray-300 p-4 text-center h-24 flex flex-col justify-center items-center">
              <img
                src={cloud}
                alt="Upload from Cloud"
                className="mb-2 cursor-pointer"
                onClick={openFilePicker}
              />
              <p className="text-xs font-medium">Transfer From Cloud</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf, .xls, .doc, .docx, .csv"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };
  

  export default ImportModal;