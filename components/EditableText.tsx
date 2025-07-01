import React, { useState, useEffect, useRef } from 'react';

interface EditableTextProps {
  initialValue: string;
  onSave: (newValue: string) => void;
  className?: string;
  inputClassName?: string;
  trigger?: React.ReactElement;
}

const EditableText: React.FC<EditableTextProps> = ({ initialValue, onSave, className, inputClassName, trigger }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (value.trim() !== '' && value.trim() !== initialValue) {
      onSave(value.trim());
    } else {
        setValue(initialValue); // revert if empty or unchanged
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          handleSave();
      } else if (e.key === 'Escape') {
          setValue(initialValue);
          setIsEditing(false);
      }
  }

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent onClick events
    setIsEditing(true);
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()} // Prevent parent onClick events
        className={inputClassName || "bg-white text-emerald-700 border border-emerald-300 rounded px-1 -my-0.5 -mx-1"}
      />
    );
  }
  
  if (trigger) {
      return React.cloneElement<any>(trigger, { onClick: handleTriggerClick });
  }

  return (
    <div onClick={handleTriggerClick} className={`cursor-pointer w-full ${className}`}>
      {value}
    </div>
  );
};

export default EditableText;