import { faFont, faLink, faPaperclip, faSmile, faTrash } from '@fortawesome/free-solid-svg-icons'
import './PromotionForm.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const PromotionForm = () => {
    return (
        <div className="promotion-container">
            <div className="promotion-form-header">
                New Message
            </div>
            
            <div className="promotion-form-body">
                <div className="form-row">
                    <label>For:</label>
                    <input type="text" value="absolute.cinema@gmail.com" readOnly />
                </div>
                
                <div className="form-row">
                    <label>From:</label>
                    <input type="text" placeholder="Your email" />
                </div>
                
                <div className="form-row">
                    <input type="text" className="subject-input" placeholder="Theme" />
                </div>

                <textarea 
                    className="message-area" 
                    placeholder="Write to us about promotions or offers..."
                ></textarea>
            </div>

            <div className="promotion-form-footer">
                <div className="footer-left-actions">
                    <div className="format-icons">
                        <FontAwesomeIcon className="icon" icon={faFont} title="Formatting" />
                        <FontAwesomeIcon className="icon" icon={faPaperclip} title="Attach" />
                        <FontAwesomeIcon className="icon" icon={faLink} title="Link" />
                        <FontAwesomeIcon className="icon" icon={faSmile} title="Emoji" />
                    </div>

                    <div className="divider"></div>

                    <button className="delete-btn" title="Delete">
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>

                <div className="footer-right-actions">
                    <button className="promotion-send-btn">Send</button>
                </div>
            </div>
        </div>
    );
};