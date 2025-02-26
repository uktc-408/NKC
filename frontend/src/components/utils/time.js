// Time formatting function
export const formatTimeAgo = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 0) {
    return dateString;
  }

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const value = Math.floor(diffInSeconds / seconds);
    if (value >= 1) {
      return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
    }
  }

  return 'just now';
};

// Format market cap display
export const formatMarketCap = (value) => {
  if (!value) return null;
  
  const num = typeof value === 'string' ? 
    parseFloat(value.replace(/[^0-9.-]+/g, "")) : 
    value;

  if (isNaN(num)) return null;

  if (num >= 1000000000) {
    return `$${(num / 1000000000).toFixed(2)}B`;
  }
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
};

// Parse market cap string to number
export const parseMarketCap = (value) => {
  if (!value) return 0;
  
  // If it's a formatted string (like $1.23M)
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    const unit = value.slice(-1).toUpperCase();
    
    switch(unit) {
      case 'B': return num * 1000000000;
      case 'M': return num * 1000000;
      case 'K': return num * 1000;
      default: return num;
    }
  }
  
  return value;
};

// Parse time string to timestamp
export const parseTimeAgo = (timeString) => {
  if (!timeString) return Date.now();
  
  // If format is "X units ago"
  if (timeString.includes('ago')) {
    const now = Date.now();
    const [value, unit] = timeString.split(' ');
    
    const units = {
      years: 31536000000,
      year: 31536000000,
      months: 2592000000,
      month: 2592000000,
      weeks: 604800000,
      week: 604800000,
      days: 86400000,
      day: 86400000,
      hours: 3600000,
      hour: 3600000,
      minutes: 60000,
      minute: 60000,
      seconds: 1000,
      second: 1000
    };

    const multiplier = units[unit.toLowerCase()] || 0;
    return now - (value * multiplier);
  }
  
  // If it's a date string, convert to timestamp
  return new Date(timeString).getTime();
}; 