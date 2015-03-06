var xmlNodeModify = '<osmChange version="0.3" generator="iD">' + 
  '<create/>' + 
  '<modify>' + 
    '<node id="-76703" lon="123.83676223498107" lat="9.632539331799256" version="1" changeset="123"/>' + 
  '</modify>'  +
  '<delete if-unused="true"/>' +
'</osmChange>' 

var jsonNodeModify = [
  {
    action: 'modify',
    attributes: {
      changeset: '123',
      id: '-76703',
      lat: '9.632539331799256',
      lon: '123.83676223498107',
      version: '1'
    },
    entity: 'node'
  }
]

var xmlCreateWay = '<osmChange version="0.3" generator="iD">' +
  '<create>' + 
    '<node id="-7" lon="123.83621506434201" lat="9.632200849325827" version="0" changeset="123"/>' +
    '<node id="-10" lon="123.84027056437253" lat="9.63569143353531" version="0" changeset="123"/>' +
    '<way id="-4" version="0" changeset="123">' +
      '<nd ref="-7"/>' + 
      '<nd ref="-10"/>' + 
      '<tag k="highway" v="residential"/>' + 
      '<tag k="name" v="Fake Street"/>' + 
    '</way>' + 
  '</create>' + 
  '<modify/>' + 
  '<delete if-unused="true"/>' + 
'</osmChange>'

var jsonWayCreate = [ 
  { 
    action: 'create',
    entity: 'node',
    attributes:  { 
      id: '-7',
      lon: '123.83621506434201',
      lat: '9.632200849325827',
      version: '0',
      changeset: '123' 
    } 
  },
  { 
    action: 'create',
    entity: 'node',
    attributes: { 
      id: '-10',
      lon: '123.84027056437253',
      lat: '9.63569143353531',
      version: '0',
      changeset: '123' 
    } 
  },
  { action: 'create',
    entity: 'way',
    attributes: { id: '-4', version: '0', changeset: '123' } 
  },
  { 
    action: 'create',
    entity: 'nd',
    attributes: { ref: '-7', way_id: '-4', sequence_id: 0 } 
  },
  { action: 'create',
    entity: 'nd',
    attributes: { ref: '-10', way_id: '-4', sequence_id: 1 } 
  },
  { 
    action: 'create',
    entity: 'tag',
    attributes: { k: 'highway', v: 'residential', entity: 'way', entity_id: '-4' } 
  },
  { 
    action: 'create',
    entity: 'tag',
    attributes: { k: 'name', v: 'Fake Street', entity: 'way', entity_id: '-4' } 
  } 
]

describe('XML', function() {
  describe('#readChanges', function() {
    it('Should translate a single node modify', function() {
      XML.readChanges(xmlNodeModify).should.be.eql(jsonNodeModify)
    }),
    it('Should translate a way creation', function() {
      XML.readChanges(xmlCreateWay).should.be.eql(jsonWayCreate)
    })
  })
})
