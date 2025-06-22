// components/OtpPopup.js
import { useState } from "react";
import { 
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
  Typography,
  styled
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../const";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    padding: theme.spacing(4),
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
    maxWidth: '450px',
    width: '100%'
  }
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '12px 0',
  fontWeight: '600',
  textTransform: 'none',
  fontSize: '16px',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none'
  }
}));

export const OtpPopup = ({ email, onClose, loading }) => {
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setOtpLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/otp_verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: email,
          otp: otp
        })
      });

      const data = await response.json();

      if (response.ok) {
        // OTP verification successful
        navigate('/login');
      } else {
        setError(data.message || "OTP verification failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("OTP verification error:", err);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <StyledDialog open={true} onClose={onClose}>
      <Box sx={{ textAlign: 'center' }}>
        <DialogTitle sx={{ p: 0 }}>
          <Typography variant="h5" component="h3" fontWeight="600">
            Verify Your Email
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ px: 0, py: 3 }}>
          <Typography variant="body1" color="text.secondary" mb={2}>
            We've sent a 6-digit code to <strong>{email}</strong>
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <TextField
                label="Enter OTP"
                variant="outlined"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                inputProps={{ maxLength: 6 }}
                disabled={otpLoading}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: '#E0E0E0',
                    },
                  },
                }}
              />
            </FormControl>
            
            {error && (
              <Typography color="error" variant="body2" mb={2}>
                {error}
              </Typography>
            )}
            
            <SubmitButton
              type="submit"
              variant="contained"
              color="primary"
              disabled={otpLoading}
              fullWidth
              sx={{ mb: 2 }}
            >
              {otpLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Verify OTP"
              )}
            </SubmitButton>
          </form>
          
          <Typography variant="body2" color="text.secondary">
            Didn't receive code? <Button variant="text" color="primary" sx={{ textTransform: 'none' }}>Resend</Button>
          </Typography>
        </DialogContent>
      </Box>
    </StyledDialog>
  );
};