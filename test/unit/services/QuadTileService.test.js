var geoRecordScale = 10000000;

describe('QuadTileService', function() {
  describe('#lonlat2tile', function() {
    it('Should return the correct tile for a lat/lon pair', function() {
      var latitude = 97378629 / geoRecordScale;
      var longitude = 1237890525 / geoRecordScale;
      QuadTileService.xy2tile(
        QuadTileService.lon2x(longitude),
        QuadTileService.lat2y(latitude)
      ).should.equal(3805368681)
    })
  })
})
