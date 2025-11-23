import { useNavigate } from "react-router-dom";
import { COLORS } from "../constants/theme";
import Transition from "../Transition";
import Icon from "../constants/Icon";
import "./styles/success.scss";

const Success = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewTicket = () => {
    // TODO: Navigate to ticket view page
    navigate("/events");
  };

  return (
    <div id="Success">
      <div className="success-container">
        {/* Header */}
        <div className="success-header">
          <div className="success-header-left">
            <span className="success-header-calendar">Calendar</span>
          </div>
          <div className="success-header-center">
            <span className="success-header-time">9:41</span>
          </div>
          <div className="success-header-right">
            <div className="success-status-icons">
              <svg width="17" height="11" viewBox="0 0 17 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="17" height="11" rx="1" fill="#EEF0FA"/>
              </svg>
              <svg width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5.5L3.5 8L8 3.5" stroke="#EEF0FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="22" height="10" rx="1" stroke="#EEF0FA" strokeWidth="2"/>
                <rect x="3" y="3" width="18" height="6" fill="#EEF0FA"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Back Button and Title */}
        <div className="success-top-bar">
          <button onClick={handleBack} className="success-back-button">
            <Icon name="left-arrow" size={24} color={COLORS.white_01} />
          </button>
          <h1 className="success-title">SUCCESS</h1>
        </div>

        {/* Main Content */}
        <div className="success-content">
          {/* Icons Circle */}
          <div className="success-icons-circle">
            <div className="success-icon success-icon-bell">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={COLORS.purple_01} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={COLORS.purple_01} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="success-icon success-icon-map">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" stroke={COLORS.purple_01} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 2v16M16 6v16" stroke={COLORS.purple_01} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="success-icon success-icon-ticket">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke={COLORS.purple_01} strokeWidth="2"/>
                <path d="M7 9h10M7 13h10M7 17h6" stroke={COLORS.purple_01} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="success-icon success-icon-calendar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke={COLORS.purple_01} strokeWidth="2"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke={COLORS.purple_01} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="success-icon success-icon-check">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="22" fill={COLORS.purple_01} stroke={COLORS.purple_01} strokeWidth="2"/>
                <path d="M16 24L22 30L32 18" stroke={COLORS.white_01} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Success Text */}
          <div className="success-text">
            <h2 className="success-main-text">SUCCESS<br/>PURCHASE</h2>
            <p className="success-subtext">Your ticket is now in<br/>your account.</p>
          </div>

          {/* View Ticket Button */}
          <button onClick={handleViewTicket} className="success-view-ticket-button">
            VIEW TICKET
          </button>
        </div>
      </div>
    </div>
  );
};

export default Transition(Success);

