import React from 'react';

const Policy = (props: { status: boolean }) => {
  const { status } = props;
  const color = status ? 'rgba(66, 153, 225, 1)' : 'rgba(255, 255, 255, 1)';
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        id="Vector"
        d="M12 3.33335L6 0.666687L0 3.33335V7.33335C0 11.0334 2.56 14.4934 6 15.3334C7.53333 14.96 8.88667 14.0667 9.92 12.86L7.84 10.78C7.19912 11.2036 6.43148 11.3925 5.66722 11.3148C4.90295 11.237 4.1891 10.8973 3.64667 10.3534C3.02225 9.728 2.67154 8.8804 2.67154 7.99669C2.67154 7.11297 3.02225 6.26537 3.64667 5.64002C4.27202 5.01561 5.11962 4.66489 6.00333 4.66489C6.88705 4.66489 7.73465 5.01561 8.36 5.64002C8.90264 6.18323 9.24138 6.89694 9.3191 7.66081C9.39682 8.42467 9.20878 9.19198 8.78667 9.83335L10.72 11.7667C11.5267 10.46 12 8.92002 12 7.33335V3.33335Z"
        fill={color}
        fillOpacity="0.8"
      />
    </svg>
  );
};

export default Policy;
