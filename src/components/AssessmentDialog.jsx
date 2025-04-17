import React, { useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import LanguageAssessment from './LanguageAssessment';
import ContactCenterAssessment from './ContactCenterAssessment';
import { useAssessment } from '../context/AssessmentContext';

const AssessmentDialog = ({ 
  open, 
  onClose, 
  selectedLanguage, 
  selectedSkill 
}) => {
  const { setCurrentAssessmentType, resetAssessment } = useAssessment();

  useEffect(() => {
    if (open) {
      if (selectedLanguage) {
        setCurrentAssessmentType('language');
      } else if (selectedSkill) {
        setCurrentAssessmentType('contactCenter');
      }
    } else {
      resetAssessment();
    }
  }, [open, selectedLanguage, selectedSkill, setCurrentAssessmentType, resetAssessment]);

  const handleClose = () => {
    onClose();
  };

  const renderAssessmentContent = () => {
    if (selectedLanguage) {
      return (
        <LanguageAssessment 
          language={selectedLanguage.id} 
          onComplete={(results) => {
            console.log('Language assessment completed:', results);
            // After completion, we can close the dialog
            setTimeout(() => onClose(), 2000);
          }} 
        />
      );
    } else if (selectedSkill) {
      // The ContactCenterAssessment component doesn't accept props in its definition,
      // it uses useParams() internally, so we don't need to pass props
      return <ContactCenterAssessment />;
    }
    return null;
  };

  const getDialogTitle = () => {
    if (selectedLanguage) {
      return `${selectedLanguage.language} Assessment`;
    } else if (selectedSkill) {
      return `${selectedSkill.name} Assessment`;
    }
    return 'Assessment';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="assessment-dialog-title"
    >
      <DialogTitle id="assessment-dialog-title">
        {getDialogTitle()}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {renderAssessmentContent()}
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentDialog;