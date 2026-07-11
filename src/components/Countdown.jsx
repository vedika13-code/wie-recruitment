import { useState, useEffect } from "react";
import PropTypes from "prop-types";

function formatRemaining(ms) {
  if (ms <= 0) return null;
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function Countdown({ deadline, label }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!deadline) return null;

  const remaining = formatRemaining(new Date(deadline).getTime() - now.getTime());

  if (!remaining) {
    return <p className="countdown countdown-closed">{label} — closed</p>;
  }

  return (
    <p className="countdown">
      {label}: {remaining.days}d {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
    </p>
  );
}

Countdown.propTypes = {
  deadline: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  label: PropTypes.string.isRequired,
};

Countdown.defaultProps = {
  deadline: null,
};

export default Countdown;
