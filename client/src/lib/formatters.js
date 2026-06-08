export const formatRupiah = (value) => {
  if (value === undefined || value === null) return 'Rp 0';
  return `Rp ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

export const formatDate = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
};

export const formatDateTime = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const options = { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  return date.toLocaleDateString('id-ID', options);
};
