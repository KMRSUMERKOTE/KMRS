import { toast } from 'react-toastify';

const Note = ({ title, text }) => (
  <div className="school-note">
    <p className="school-note-title">{title}</p>
    <p className="school-note-text">{text}</p>
  </div>
);

// Use for every success message in the admin pages.
export const notifySuccess = (text, title = 'Well done!') =>
  toast(<Note title={title} text={text} />, {
    className: 'school-toast',
    progressClassName: 'school-toast-progress',
    icon: <span className="school-stamp" aria-hidden="true">✓</span>,
    ariaLabel: `${title} ${text}`,
  });