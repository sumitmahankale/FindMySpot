import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ListerTermsAndConditions = () => {
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
    strong: {
      fontWeight: 'bold'
    }
  };

  const handleAccept = () => {
    setAccepted(true);
    // Store acceptance in localStorage for future reference
    localStorage.setItem('listerTermsAccepted', 'true');
    // Redirect to lister signup page
    navigate('/listersignup');
  };

  return (
    <div style={styles.termsContainer}>
      <div style={styles.termsContent}>
        <h1 style={styles.heading}>Lister Terms and Conditions</h1>
        
        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>1. Introduction</h2>
          <p style={styles.sectionText}>
            Welcome to FindMySpot's Lister Program. By registering as a Lister and using our service, you agree to be bound by these Terms and Conditions.
            FindMySpot provides a platform that connects parking space owners (Listers) with drivers seeking parking.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>2. Definitions</h2>
          <p style={styles.sectionText}>
            <span style={styles.strong}>"FindMySpot"</span> refers to our company, platform, mobile application, and website.
            <br />
            <span style={styles.strong}>"Lister"</span> refers to individuals or entities who list available parking spaces on our platform.
            <br />
            <span style={styles.strong}>"Users"</span> refers to individuals seeking parking spaces through FindMySpot.
            <br />
            <span style={styles.strong}>"Listing"</span> refers to a parking space advertised by a Lister on FindMySpot.
            <br />
            <span style={styles.strong}>"Service"</span> refers to the parking locator platform provided by FindMySpot.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>3. Lister Account</h2>
          <p style={styles.sectionText}>
            3.1. To become a Lister, you must register for an account and provide accurate information.
            <br />
            3.2. You must be at least 18 years old to register as a Lister.
            <br />
            3.3. You are responsible for maintaining the confidentiality of your account credentials.
            <br />
            3.4. You must provide accurate banking information for receiving payments.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>4. Listing Requirements</h2>
          <p style={styles.sectionText}>
            4.1. You must have legal rights to list any parking space (ownership, lease, or authorization).
            <br />
            4.2. You must provide accurate information about the location, size, and condition of the parking space.
            <br />
            4.3. You must clearly indicate any restrictions, such as vehicle size limitations or time constraints.
            <br />
            4.4. You must provide clear instructions for accessing the parking space.
            <br />
            4.5. You must keep your listing's availability status accurate and up-to-date.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>5. Lister Responsibilities</h2>
          <p style={styles.sectionText}>
            5.1. You are responsible for ensuring the parking space is available during the listed times.
            <br />
            5.2. You must respond promptly to inquiries from Users or FindMySpot.
            <br />
            5.3. You must ensure the parking space is safe, accessible, and as described in your listing.
            <br />
            5.4. You are responsible for compliance with all local regulations regarding private parking rentals.
            <br />
            5.5. You must report any issues or damages to FindMySpot immediately.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>6. Fees and Payments</h2>
          <p style={styles.sectionText}>
            6.1. FindMySpot charges a commission on each successful parking transaction, which will be clearly communicated.
            <br />
            6.2. Payment processing is handled by secure third-party payment processors.
            <br />
            6.3. You will receive payments according to the payment schedule outlined in your Lister agreement.
            <br />
            6.4. You are responsible for any taxes applicable to income received through FindMySpot.
            <br />
            6.5. FindMySpot reserves the right to withhold payment in cases of dispute or policy violation.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>7. Cancellations and Refunds</h2>
          <p style={styles.sectionText}>
            7.1. Your cancellation policy must be clearly stated in your listing.
            <br />
            7.2. Unreasonable or frequent cancellations may result in penalties or account suspension.
            <br />
            7.3. If you cancel a confirmed booking, you may be subject to cancellation fees.
            <br />
            7.4. FindMySpot reserves the right to issue refunds to Users in accordance with our Refund Policy.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>8. Liability and Insurance</h2>
          <p style={styles.sectionText}>
            8.1. You are responsible for obtaining appropriate insurance for your parking space.
            <br />
            8.2. FindMySpot is not liable for damages to your property caused by Users.
            <br />
            8.3. You agree to indemnify FindMySpot against any claims arising from your listings.
            <br />
            8.4. FindMySpot does not guarantee the behavior or reliability of Users.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>9. Prohibited Activities</h2>
          <p style={styles.sectionText}>
            9.1. Listing parking spaces you do not have the right to offer.
            <br />
            9.2. Providing false or misleading information about your parking space.
            <br />
            9.3. Bypassing FindMySpot's platform to arrange direct bookings with Users.
            <br />
            9.4. Discriminating against Users based on race, religion, nationality, gender, disability, or any other protected classification.
            <br />
            9.5. Creating multiple listings for the same parking space.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>10. Account Suspension and Termination</h2>
          <p style={styles.sectionText}>
            10.1. FindMySpot reserves the right to suspend or terminate your Lister account for violations of these Terms.
            <br />
            10.2. Repeated cancellations, poor ratings, or User complaints may lead to account termination.
            <br />
            10.3. You may terminate your Lister account by contacting customer support, subject to fulfilling any existing bookings.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>11. Changes to Terms</h2>
          <p style={styles.sectionText}>
            11.1. FindMySpot reserves the right to modify these Lister Terms at any time.
            <br />
            11.2. We will notify Listers of significant changes to these Terms.
            <br />
            11.3. Continued use of FindMySpot after changes constitutes acceptance of the new Terms.
          </p>
        </div>

        <div style={styles.termsSection}>
          <h2 style={styles.sectionHeading}>12. Contact Information</h2>
          <p style={styles.sectionText}>
            If you have any questions about these Lister Terms, please contact us at lister-support@findmyspot.com.
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
            I have read and agree to the Lister Terms and Conditions
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

export default ListerTermsAndConditions;