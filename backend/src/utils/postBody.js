const attachMedicineImage = (body, file) => {
  const data = { ...body };
  if (file) {
    data.medicineImage = `/uploads/${file.filename}`;
  } else if (data.removeMedicineImage === 'true' || data.removeMedicineImage === true) {
    data.medicineImage = '';
  }
  delete data.removeMedicineImage;
  return data;
};

module.exports = { attachMedicineImage };
