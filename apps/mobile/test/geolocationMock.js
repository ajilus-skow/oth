module.exports = {
  getCurrentPosition: jest.fn(success => success({ coords: { latitude: 0, longitude: 0 } }))
};
