import { useState, useRef } from 'react';

export const useInventoryModal = (onModalClose: () => void, onImport: (data: any[]) => void) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [remainingKB, setRemainingKB] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [fileName, setFileName] = useState<string>("");
  const [fileInputKey, setFileInputKey] = useState<number>(0);
 const [imageUrl, setImageUrl] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileSizeKB = Math.round(file.size / 1024);
      setFileName(file.name);
      setRemainingKB(fileSizeKB);
      setSecondsRemaining(5);
      setUploading(true);

      let uploadedKB = 0;
      const interval = setInterval(() => {
        const increment = Math.ceil(fileSizeKB / 5);
        uploadedKB += increment;

        const newProgress = Math.min((uploadedKB / fileSizeKB) * 100, 100);
        const remaining = Math.max(fileSizeKB - uploadedKB, 0);
        const timeLeft = Math.ceil((remaining / fileSizeKB) * 5);

        setProgress(newProgress);
        setRemainingKB(remaining);
        setSecondsRemaining(timeLeft);

        if (newProgress === 100) {
          clearInterval(interval);
          setUploading(false);
          setFileInputKey((prevKey) => prevKey + 1);
        }
      }, 1000);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const fileSizeKB = Math.round(file.size / 1024);
      setFileName(file.name);
      setRemainingKB(fileSizeKB);
      setSecondsRemaining(5);
      setUploading(true);

      let uploadedKB = 0;
      const interval = setInterval(() => {
        const increment = Math.ceil(fileSizeKB / 5);
        uploadedKB += increment;

        const newProgress = Math.min((uploadedKB / fileSizeKB) * 100, 100);
        const remaining = Math.max(fileSizeKB - uploadedKB, 0);
        const timeLeft = Math.ceil((remaining / fileSizeKB) * 5);

        setProgress(newProgress);
        setRemainingKB(remaining);
        setSecondsRemaining(timeLeft);

        if (newProgress === 100) {
          clearInterval(interval);
          setUploading(false);
          setFileInputKey((prevKey) => prevKey + 1);
        }
      }, 1000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const text = event.target?.result as string;
        const rows = text.split("\n").map((row) => row.split(","));
        const importedData = rows.slice(1).map(([product, price, stock]) => ({
          product,
          price: parseFloat(price),
          stock,
        }));
        onImport(importedData);
        onModalClose();
      };
      reader.readAsText(file);
    }
  };
 const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setImageUrl(url);
  };

  const handleImageClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return {
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
    setImageUrl,
    inputRef,
    handleUrlChange,
    handleImageClick,
  };
};
