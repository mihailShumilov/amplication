import React, { useCallback } from "react";
// import "./FileUpload.scss";

export type Props = {
  label: string;
  onClick: (selected: boolean) => void;
};

export const FileUpload = ({ label, onClick }: Props) => {
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onClick(event.target.checked);
    },
    [onClick]
  );

  return (
    <div className="toggle-button">
      <label>
        <input title={label} type="file" onChange={handleInputChange} />
        <span>{label}</span>
      </label>
    </div>
  );
};
