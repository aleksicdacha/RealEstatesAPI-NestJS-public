import React, { useRef, useState } from 'react';
import { FileUpload, ItemTemplateOptions } from 'primereact/fileupload';
import { Galleria } from "primereact/galleria";
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';

interface ImageUploaderProps {
  propertyId: string; // UUID of the current property
  propertyCode: string; // Property code from the wizard
  onNext: (imageData: { url: string }[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ propertyId, onNext, propertyCode }) => {


  const toast = useRef<Toast>(null);
  const [uploadedImages, setUploadedImages] = useState<{ url: string }[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const fileUploadRef = useRef<FileUpload>(null);

  const onTemplateSelect = (e: { files: File[] }) => {
    let _totalSize = totalSize;
    const files = e.files;

    files.forEach((file) => {
      _totalSize += file.size || 0;
    });

    setTotalSize(_totalSize);
  };

  const onTemplateUpload = (e: { files: File[] }) => {
    let _totalSize = 0;

    e.files.forEach((file: File) => {
      _totalSize += file.size || 0;
    });

    setTotalSize(_totalSize);
    toast.current?.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
  };

  const onTemplateRemove = (file: object, callback: (event: React.SyntheticEvent) => void) => {
    // For simplicity, we'll assume file has a size property
    const fileWithSize = file as { size?: number };
    setTotalSize(totalSize - (fileWithSize.size || 0));
    callback({} as React.SyntheticEvent);
  };

  const onTemplateClear = () => {
    setTotalSize(0);
  };

  const headerTemplate = (options: { className: string; chooseButton: React.ReactNode; uploadButton: React.ReactNode; cancelButton: React.ReactNode }) => {
    const { className, chooseButton, uploadButton, cancelButton } = options;
    const value = totalSize / 10000;
    const formatedValue = fileUploadRef && fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B';

    return (
      <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
        {chooseButton}
        {uploadButton}
        {cancelButton}
        <div className="flex align-items-center gap-3 ml-auto">
          <span>{formatedValue} / 1 MB</span>
          <ProgressBar value={value} showValue={false} style={{ width: '10rem', height: '12px' }}></ProgressBar>
        </div>
      </div>
    );
  };

  const itemTemplate = (file: object, props: ItemTemplateOptions) => {
    const fileObj = file as { name: string; objectURL?: string; size?: number };
    return (
      <div className="flex align-items-center flex-wrap">
        <div className="flex align-items-center" style={{ width: '40%' }}>
          <img alt={fileObj.name} role="presentation" src={fileObj.objectURL} width={100} />
          <span className="flex flex-column text-left ml-3">
                        {fileObj.name}
            <small>{new Date().toLocaleDateString()}</small>
                    </span>
        </div>
        <Tag value={props.formatSize} severity="warning" className="px-3 py-2 rounded-full" />
        <Button type="button" icon="pi pi-trash" className="p-button-outlined p-button-rounded p-button-danger ml-auto px-2" onClick={() => onTemplateRemove(file, props.onRemove)} />
      </div>
    );
  };

  const emptyTemplate = () => {
    return (
      <div className="flex align-items-center flex-column">
        <i className="pi pi-image mt-2 p-4" style={{ fontSize: '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
        <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-2">
                    Drag and Drop Image Here
                </span>
      </div>
    );
  };

  const chooseOptions = { icon: 'pi pi-fw pi-images', iconOnly: false, className: 'custom-choose-btn p-button-rounded p-button-outlined' };
  const uploadOptions = { icon: 'pi pi-fw pi-cloud-upload', iconOnly: false, className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined' };
  const cancelOptions = { icon: 'pi pi-fw pi-times', iconOnly: false, className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined' };

  const handleUpload = async (e: { files: File[] }) => {
    if (!propertyCode) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Property code is required.',
        life: 5000
      });
      return;
    }

    const formData = new FormData();
    formData.append('propertyUUID', propertyId);
    for (const file of e.files) {
      formData.append("files", file);
    }

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const uploadUrl = `${baseURL}/v1/upload?propertyCode=${propertyCode}`;
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('access_token');
      
      // Upload images to storage but don't associate with property yet
      // Property association will happen when the wizard is completed
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText} (${uploadResponse.status})`);
      }

      const uploadedFiles = await uploadResponse.json();
      if (!Array.isArray(uploadedFiles)) {
        throw new Error("Unexpected response format from upload API");
      }

      // Store uploaded images in local state for now
      const imagesData = uploadedFiles.map((file) => ({ url: file.url }));
      setUploadedImages(imagesData);
      
      // Notify parent component about uploaded images
      onNext?.(imagesData);

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Images uploaded successfully!',
        life: 3000
      });

    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        life: 5000
      });
    }
  };


  return (
    <div>
      {/* <h2>Image Uploader</h2> */}

      <Toast ref={toast}></Toast>

      <Tooltip target=".custom-choose-btn" content="Choose" position="bottom" />
      <Tooltip target=".custom-upload-btn" content="Upload" position="bottom" />
      <Tooltip target=".custom-cancel-btn" content="Clear" position="bottom" />

      <FileUpload
        ref={fileUploadRef}
        name="files"
        multiple
        customUpload
        accept="image/*"
        maxFileSize={5000000}
        uploadHandler={handleUpload}
        onUpload={onTemplateUpload}
        onSelect={onTemplateSelect}
        onError={onTemplateClear}
        onClear={onTemplateClear}
        headerTemplate={headerTemplate}
        itemTemplate={itemTemplate}
        emptyTemplate={emptyTemplate}
        chooseOptions={chooseOptions}
        uploadOptions={uploadOptions}
        cancelOptions={cancelOptions}
      />

      {uploadedImages.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Uploaded Images</h3>
          <Galleria
            value={uploadedImages}
            activeIndex={0}
            item={(item) => (
              <img
                src={`http://localhost:3000${item?.url.startsWith('/uploads/') ? item.url : '/uploads/' + item.url}`}
                alt="Uploaded Image"
                style={{ width: "100%", objectFit: "cover" }}
              />
            )}
            thumbnail={(item) => (
              <img
                src={`http://localhost:3000${item?.url.startsWith('/uploads/') ? item.url : '/uploads/' + item.url}`}
                alt="Uploaded Thumbnail"
                style={{ width: "60%", objectFit: "cover" }}
              />
            )}
            showThumbnails
            numVisible={5}
            style={{ maxWidth: "500px", margin: "auto" }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
