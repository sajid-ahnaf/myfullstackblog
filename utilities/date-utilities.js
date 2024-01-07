const addHours = (numOfHours, date = new Date()) => {
  date.setTime(numOfHours * 60 * 60 * 1000);

  return date;
}

module.exports = {
  addHours
}