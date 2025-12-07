import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Subject as SubjectIcon,
} from '@mui/icons-material';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const contactInfo = [
    {
      icon: <PhoneIcon />,
      title: 'Phone',
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
      description: 'Mon-Fri from 8am to 6pm',
    },
    {
      icon: <EmailIcon />,
      title: 'Email',
      details: ['support@freelancepro.com', 'sales@freelancepro.com'],
      description: 'We respond within 24 hours',
    },
    {
      icon: <LocationIcon />,
      title: 'Office',
      details: ['123 Tech Street', 'San Francisco, CA 94107', 'United States'],
      description: 'Headquarters',
    },
    {
      icon: <ScheduleIcon />,
      title: 'Working Hours',
      details: ['Monday - Friday: 9:00 AM - 6:00 PM', 'Saturday: 10:00 AM - 4:00 PM'],
      description: 'Pacific Time Zone',
    },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Form submitted:', formData);
    
    setSnackbar({
      open: true,
      message: 'Your message has been sent successfully! We\'ll get back to you soon.',
      severity: 'success',
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      category: '',
      message: '',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const categories = [
    'General Inquiry',
    'Technical Support',
    'Billing',
    'Partnership',
    'Feedback',
    'Report a Problem',
    'Other',
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h1" fontWeight="bold" gutterBottom>
            Get in Touch
          </Typography>
          <Typography variant="h5" sx={{ maxWidth: 800, margin: '0 auto', opacity: 0.9 }}>
            Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
          </Typography>
        </Container>
      </Box>

      {/* Contact Information */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {contactInfo.map((info, index) => (
            <Grid item xs={12} md={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Box sx={{ color: 'primary.main', mb: 2, fontSize: 40 }}>
                  {info.icon}
                </Box>
                <Typography variant="h5" gutterBottom>
                  {info.title}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {info.details.map((detail, idx) => (
                    <Typography key={idx} variant="body1">
                      {detail}
                    </Typography>
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {info.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Contact Form & FAQ */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Grid container spacing={6}>
          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom>
                Send us a Message
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4 }}>
                Fill out the form below and we'll get back to you as soon as possible.
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SubjectIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        label="Category"
                      >
                        <MenuItem value="">
                          <em>Select a category</em>
                        </MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      multiline
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell us how we can help..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      endIcon={<SendIcon />}
                      fullWidth
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          {/* FAQ & Map */}
          <Grid item xs={12} md={5}>
            {/* FAQ Section */}
            <Paper sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Frequently Asked Questions
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                {[
                  {
                    q: 'How do I create a freelancer profile?',
                    a: 'Click on "Sign Up" and select "Join as Freelancer". Fill in your details, skills, and portfolio to create a complete profile.',
                  },
                  {
                    q: 'What are the payment methods?',
                    a: 'We support credit/debit cards, PayPal, bank transfers, and several local payment methods depending on your country.',
                  },
                  {
                    q: 'How are disputes resolved?',
                    a: 'We have a dedicated dispute resolution team that mediates between clients and freelancers to find fair solutions.',
                  },
                  {
                    q: 'Is there a fee for using the platform?',
                    a: 'Freelancers pay a service fee of 10% on completed projects. Clients can post projects for free and pay only when they hire someone.',
                  },
                ].map((faq, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {faq.q}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {faq.a}
                    </Typography>
                    {index < 3 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Box>

              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                href="/faq"
              >
                View All FAQs
              </Button>
            </Paper>

            {/* Map Placeholder */}
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Our Location
              </Typography>
              <Box
                sx={{
                  height: 200,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  mt: 2,
                }}
              >
                <Typography color="text.secondary">
                  Interactive Map Would Go Here
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Support Channels */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom>
            Additional Support Channels
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
            Choose the most convenient way to reach us
          </Typography>
          
          <Grid container spacing={4}>
            {[
              {
                title: 'Live Chat',
                description: 'Chat with our support team in real-time',
                action: 'Start Chat',
                icon: '💬',
                color: '#4caf50',
              },
              {
                title: 'Help Center',
                description: 'Browse our knowledge base and tutorials',
                action: 'Visit Help Center',
                icon: '📚',
                color: '#2196f3',
              },
              {
                title: 'Community Forum',
                description: 'Get help from other freelancers and clients',
                action: 'Join Forum',
                icon: '👥',
                color: '#ff9800',
              },
              {
                title: 'Social Media',
                description: 'Follow us for updates and tips',
                action: 'Follow Us',
                icon: '📱',
                color: '#9c27b0',
              },
            ].map((channel, index) => (
              <Grid item xs={12} md={3} key={index}>
                <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <Box
                    sx={{
                      fontSize: '3rem',
                      mb: 2,
                    }}
                  >
                    {channel.icon}
                  </Box>
                  <Typography variant="h5" gutterBottom>
                    {channel.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    {channel.description}
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    {channel.action}
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Snackbar for success message */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;