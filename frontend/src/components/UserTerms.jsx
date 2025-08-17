import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TermsAndConditions = () => {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  // Define colors from your palette
  const colors = {
    darkBlue: '#1a2b47',
    mediumBlue: '#2d4263',
    lightBlue: '#3e5f8a',
    orange: 'rgb(255, 98, 0)',
    lightOrange: '#ff9a40',
    textLight: '#f5f5f5',
    textDark: '#333333',
    background: '#f9f9f9'
  };

  const styles = {
    termsContainer: {
      backgroundColor: colors.background,
      padding: '2rem 0',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    },
    termsContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      padding: '2rem',
      maxWidth: '800px',
      width: '100%',
      margin: '0 auto'
    },
    heading: {
      color: colors.darkBlue,
      textAlign: 'center',
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: `2px solid ${colors.lightBlue}`
    },
    termsSection: {
      marginBottom: '1.5rem'
    },
    sectionHeading: {
      color: colors.mediumBlue,
      fontSize: '1.3rem',
      marginBottom: '0.75rem'
    },
    sectionText: {
      color: colors.textDark,
      lineHeight: '1.6',
      marginBottom: '1rem'
    },
    acceptanceSection: {
      marginTop: '2rem',
      paddingTop: '1rem',
      borderTop: '1px solid #eee',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1rem',
      cursor: 'pointer',
      userSelect: 'none',
      position: 'relative',
      paddingLeft: '35px',
      color: colors.textDark
    },
    checkbox: {
      position: 'absolute',
      opacity: '0',
      cursor: 'pointer',
      height: '0',
      width: '0'
    },
    checkmark: {
      position: 'absolute',
      top: '0',
      left: '0',
      height: '20px',
      width: '20px',
      backgroundColor: '#eee',
      borderRadius: '4px'
    },
    checkmarkChecked: {
      backgroundColor: colors.orange
    },
    checkmarkAfter: {
      content: '""',
      position: 'absolute',
      display: 'block',
      left: '7px',
      top: '3px',
      width: '5px',
      height: '10px',
      border: 'solid white',
      borderWidth: '0 2px 2px 0',
      transform: 'rotate(45deg)'
    },
    acceptButton: {
      backgroundColor: accepted ? colors.orange : '#cccccc',
      color: colors.textLight,
      border: 'none',
      padding: '0.75rem 2rem',
      borderRadius: '30px',
      fontWeight: 'bold',
      cursor: accepted ? 'pointer' : 'not-allowed',
      transition: 'background-color 0.3s ease'
    },
    acceptButtonHover: {
      backgroundColor: colors.lightOrange
    },
    strong: {
      fontWeight: 'bold'
    }
  };

  const handleAccept = () => {
    setAccepted(true);
    // Store acceptance in localStorage for future reference
    localStorage.setItem('termsAccepted', 'true');
    // Redirect to signup page
    navigate('/signup');
  };

  return (
    <div style={styles.termsContainer}>
      <div style={styles.termsContent}>
        <h1 style={styles.heading}>Terms and Conditions</h1>
        
        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>1. Introduction</h2>
          <p style={styles.sectionText}>
            Welcome to FindMySpot. By accessing or using our service, you agree to be bound by these Terms and Conditions. 
            FindMySpot provides a real-time parking locator platform that connects drivers with available parking spaces.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>2. Definitions</h2>
          <p style={styles.sectionText}>
            <span style={styles.strong}>"FindMySpot"</span> refers to our company, platform, mobile application, and website.
            <br />
            <span style={styles.strong}>"Users"</span> refers to individuals who use FindMySpot to find parking.
            <br />
            <span style={styles.strong}>"Listers"</span> refers to individuals or entities who list available parking spaces.
            <br />
            <span style={styles.strong}>"Service"</span> refers to the parking locator platform provided by FindMySpot.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>3. Account Registration</h2>
          <p style={styles.sectionText}>
            3.1. To access certain features of FindMySpot, you must register for an account.
            <br />
            3.2. You agree to provide accurate and complete information during registration.
            <br />
            3.3. You are responsible for maintaining the confidentiality of your account credentials.
            <br />
            3.4. You are responsible for all activities that occur under your account.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>4. User Conduct</h2>
          <p style={styles.sectionText}>
            4.1. You agree not to use FindMySpot for any illegal purpose or in violation of any local, state, national, or international law.
            <br />
            4.2. You agree not to provide false or misleading information about parking availability.
            <br />
            4.3. You agree not to interfere with or disrupt the service or servers connected to FindMySpot.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>5. Parking Space Listings</h2>
          <p style={styles.sectionText}>
            5.1. Listers must have legal rights to list the parking spaces they offer.
            <br />
            5.2. Listers must provide accurate information about the location, availability, and conditions of their parking spaces.
            <br />
            5.3. FindMySpot reserves the right to remove any listing at its sole discretion.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>6. Payments and Fees</h2>
          <p style={styles.sectionText}>
            6.1. FindMySpot may charge fees for certain services, which will be clearly communicated.
            <br />
            6.2. Payment processing is handled by secure third-party payment processors.
            <br />
            6.3. All fees are non-refundable unless otherwise stated.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>7. Liability Limitations</h2>
          <p style={styles.sectionText}>
            7.1. FindMySpot is not responsible for the accuracy of parking information provided by Listers.
            <br />
            7.2. FindMySpot is not responsible for any damages to vehicles while parked in spaces found through our Service.
            <br />
            7.3. FindMySpot's liability is limited to the amount paid by the User for the specific service.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>8. Privacy</h2>
          <p style={styles.sectionText}>
            8.1. Our Privacy Policy explains how we collect, use, and protect your information.
            <br />
            8.2. By using FindMySpot, you consent to our data practices as described in our Privacy Policy.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>9. Termination</h2>
          <p style={styles.sectionText}>
            9.1. FindMySpot reserves the right to terminate or suspend your account at any time for violations of these Terms.
            <br />
            9.2. You may terminate your account at any time by contacting customer support.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>10. Changes to Terms</h2>
          <p style={styles.sectionText}>
            10.1. FindMySpot reserves the right to modify these Terms at any time.
            <br />
            10.2. We will notify Users of significant changes to these Terms.
            <br />
            10.3. Continued use of FindMySpot after changes constitutes acceptance of the new Terms.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>11. Contact Information</h2>
          <p style={styles.sectionText}>
            If you have any questions about these Terms, please contact us at support@findmyspot.com.
          </p>
        </div>

        <div style={styles.acceptanceSection}>
          <label style={styles.checkboxContainer}>
            <input 
              type="checkbox" 
              checked={accepted} 
              onChange={() => setAccepted(!accepted)} 
              style={styles.checkbox}
            />
            <span style={{
              ...styles.checkmark,
              ...(accepted ? styles.checkmarkChecked : {})
            }}></span>
            {accepted && <span style={styles.checkmarkAfter}></span>}
            I have read and agree to the Terms and Conditions
          </label>
          
          <button 
            style={styles.acceptButton}
            disabled={!accepted}
            onClick={handleAccept}
            onMouseOver={(e) => {
              if (accepted) {
                e.target.style.backgroundColor = colors.lightOrange;
              }
            }}
            onMouseOut={(e) => {
              if (accepted) {
                e.target.style.backgroundColor = colors.orange;
              }
            }}
          >
            Accept Terms
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;