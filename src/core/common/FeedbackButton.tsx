import * as React from 'react';
import { Label } from '@fluentui/react/lib/Label';
import Environment from '../../Environment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Color from '../libraries/Color';
import { faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons';

class FeedbackButton extends React.Component<any, any> {
  
  render() {
    // Initialization if no cache, else set the button's status
    let buttonStatus = null;
    let localCache = localStorage.getItem("feedback-button-status");
    switch (localCache) {
      case "show":
        {
          buttonStatus = true;
          break;
        }
      case "hide":
        {
          buttonStatus = false;
          break;
        }
      default:
        {
          localStorage.setItem("feedback-button-status", "show");
          buttonStatus = true;
          break;
        }
    }
    if (buttonStatus === true) {
      return (
        <div className="Feedback">
          {/* Button Feedback */}
          <Label className="feedback-text" onClick={() => {
            window.open(Environment.feedbackUrl, "_blank");
          }}>
            Feedback&nbsp;
              </Label>
          {/* Button Show/Hide */}
          <span onClick={() => {
            localStorage.setItem("feedback-button-status", "hide");
            this.forceUpdate();
          }}>
            <FontAwesomeIcon style={{ color: Color.WHITE, fontSize: "25px", display: "table-cell", textAlign: "center", marginTop: "10px", cursor: "pointer" }} icon={faAngleDoubleDown} />
          </span>
        </div>
      );
    }
    else {
      return (
        <div className="Feedback-hidden" title="Feedback" onClick={() => {
          localStorage.setItem("feedback-button-status", "show");
          this.forceUpdate();
        }}>
          &nbsp;
        </div>
      );
    }
  }
}

export default FeedbackButton;