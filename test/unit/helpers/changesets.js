'use strict';
module.exports.createWay = '<osmChange version="0.3" generator="iD">' +
  '<create>' +
    '<node id="-1" lon="124.15472633706449" lat="10.151493406454932" version="0" changeset="1"/>' +
    '<node id="-4" lon="124.15647513734223" lat="10.153431321701245" version="0" changeset="1"/>' +
    '<node id="-5" lon="124.15747513734223" lat="10.153431321701245" version="0" changeset="1"/>' +
    '<way id="-1" version="0" changeset="1">' +
      '<nd ref="-1"/>' +
      '<nd ref="-4"/>' +
      '<nd ref="-5"/>' +
    '<tag k="highway" v="tertiary"/>' +
    '<tag k="name" v="Common Road Name"/>' +
    '</way>' +
  '</create>' +
  '<modify/>' +
  '<delete if-unused="true"/>' +
  '</osmChange>';

module.exports.createLongWay = function() {
  var s = '<osmChange version="0.3" generator="iD"><create>';

  for ( var i = -1; i >= -10; i--) {
    s += '<node id="'+ i +'" lon="'+ (124.15472633706449 - i * 0.1) +' " lat="10.151493406454932" version="0" changeset="1"/>';
  }

  s += '<way id="-1" version="0" changeset="1">';

  for ( i = -1; i >= -10; i-- ) {
    s += '<nd ref="'+ i  +'"/>';
  }

  s = s + '<tag k="highway" v="tertiary"/>' +
    '<tag k="name" v="Common Road Name"/>' +
    '</way>' +
  '</create>' +
  '<modify/>' +
  '<delete if-unused="true"/>' +
  '</osmChange>';
  return s;
};

module.exports.modifyWay = function(node1, node2, node3, way) {

  var xml = '<osmChange version="0.3" generator="iD">' +
  '<create/>' +
  '<modify>' +
    '<node id="'+ node3 +'" lon="124.15747513734223" lat="10.153431321701245" version="0" changeset="1"/>' +
    '<way id="' + way + '" version="0" changeset="1">' +
      '<nd ref="'+ node1 +'"/>' +
      '<nd ref="'+ node3 +'"/>' +
    '<tag k="highway" v="tertiary"/>' +
    '<tag k="name" v="Common Road Name"/>' +
    '</way>' +
  '</modify>' +
  '<delete if-unused="true">' +
      '<node id="'+ node2 + '" lon="124.15647513734223" lat="10.153431321701245" version="0" changeset="1"/>' +
  '</delete>' +
  '</osmChange>';
  return xml;
};

module.exports.modifyLongWay = function(nodes, way) {

  var xml = '<osmChange version="0.3" generator="iD">' +
  '<create/>' +
  '<modify>' +
    '<node id="'+ nodes[2] +'" lon="124.15747513734223" lat="10.153431321701245" version="0" changeset="1"/>' +
    '<way id="' + way + '" version="0" changeset="1">' +
      '<nd ref="'+ nodes[0] +'"/>';
      for (var i = 2; i < 10; i++) {
        xml += '<nd ref="'+ nodes[i] +'"/>';
      }
  xml += '<tag k="highway" v="tertiary"/>' +
    '<tag k="name" v="Common Road Name"/>' +
    '</way>' +
  '</modify>' +
  '<delete if-unused="true">' +
      '<node id="'+ nodes[1] + '" lon="124.15647513734223" lat="10.153431321701245" version="0" changeset="1"/>' +
  '</delete>' +
  '</osmChange>';
  return xml;
};

module.exports.createNode = function(id) {
  return '<osmChange version="0.3" generator="iD">' +
  '<create>' +
    '<node id="'+ id +'" lon="123.71275264816284" lat="9.626730050553016" version="1" changeset="1"/>' +
  '</create>' +
  '<modify/>' +
  '<delete if-unused="true"/>' +
  '</osmChange>';
};


module.exports.modifyNode = function(id) {
  return '<osmChange version="0.3" generator="iD">' +
  '<create/>' +
  '<modify>' +
    '<node id="'+ id +'" lon="123.81275264816284" lat="9.626730050553016" version="1" changeset="1"/>' +
  '</modify>' +
  '<delete if-unused="true"/>' +
  '</osmChange>';
};

module.exports.deleteNode = function(id) {
  return '<osmChange version="0.3" generator="iD">' +
  '<create/>' +
  '<modify/>' +
  '<delete if-unused="true">' +
      '<node id="'+ id + '" lon="123.81275264816284" lat="9.626730050553016" version="0" changeset="1"/>' +
  '</delete>' +
'</osmChange>'
};

module.exports.json = {
  json: {"osmChange":{"version":0.1,"generator":"openroads-iD","create":{},"modify":{"node":[{"id":"21851","lon":123.9780018,"lat":9.7923478,"version":"1","tag":[],"changeset":1}],"way":[{"id":"21838","version":"1","nd":[{"ref":"12482"},{"ref":"21839"},{"ref":"21840"},{"ref":"21841"},{"ref":"21842"},{"ref":"21843"},{"ref":"21844"},{"ref":"21845"},{"ref":"21846"},{"ref":"21847"},{"ref":"21848"},{"ref":"21849"},{"ref":"21850"},{"ref":"21851"},{"ref":"21853"},{"ref":"21854"},{"ref":"21855"},{"ref":"21856"},{"ref":"21857"},{"ref":"21858"},{"ref":"21859"},{"ref":"21860"},{"ref":"21861"},{"ref":"21862"},{"ref":"21863"},{"ref":"21864"},{"ref":"21865"},{"ref":"21866"},{"ref":"21867"},{"ref":"21868"},{"ref":"21869"},{"ref":"21870"},{"ref":"21871"},{"ref":"21872"},{"ref":"21873"},{"ref":"21874"},{"ref":"21875"},{"ref":"21876"},{"ref":"21877"},{"ref":"21878"},{"ref":"21879"},{"ref":"21880"},{"ref":"21881"},{"ref":"21882"},{"ref":"21883"},{"ref":"21884"},{"ref":"21885"},{"ref":"21886"},{"ref":"21887"},{"ref":"21888"},{"ref":"21889"},{"ref":"21890"},{"ref":"21891"},{"ref":"21892"},{"ref":"21893"},{"ref":"21894"},{"ref":"21895"},{"ref":"21896"},{"ref":"21897"},{"ref":"21898"},{"ref":"21899"},{"ref":"21900"},{"ref":"21901"},{"ref":"21902"},{"ref":"21903"},{"ref":"21904"},{"ref":"21905"},{"ref":"21906"},{"ref":"21907"},{"ref":"21908"},{"ref":"21909"},{"ref":"21910"},{"ref":"21911"},{"ref":"21912"},{"ref":"21913"},{"ref":"21914"},{"ref":"21915"},{"ref":"21916"},{"ref":"21917"},{"ref":"21918"},{"ref":"21919"},{"ref":"21920"},{"ref":"21921"},{"ref":"21922"},{"ref":"21923"},{"ref":"21924"},{"ref":"21925"},{"ref":"21926"},{"ref":"21927"},{"ref":"21928"},{"ref":"21929"},{"ref":"21930"},{"ref":"21931"},{"ref":"21932"},{"ref":"21933"},{"ref":"21934"},{"ref":"21935"},{"ref":"21936"},{"ref":"21937"},{"ref":"21938"},{"ref":"21939"},{"ref":"21940"},{"ref":"21941"},{"ref":"21942"},{"ref":"21943"},{"ref":"21944"},{"ref":"21945"},{"ref":"21946"},{"ref":"21947"},{"ref":"21948"},{"ref":"21949"},{"ref":"21950"},{"ref":"21951"},{"ref":"21952"},{"ref":"21953"},{"ref":"21954"},{"ref":"21955"},{"ref":"21956"},{"ref":"21957"},{"ref":"21958"},{"ref":"21959"},{"ref":"21960"},{"ref":"21961"},{"ref":"21962"},{"ref":"21963"},{"ref":"21964"},{"ref":"21965"},{"ref":"21966"},{"ref":"21967"},{"ref":"21968"},{"ref":"21969"},{"ref":"21970"},{"ref":"21971"},{"ref":"21972"},{"ref":"21973"},{"ref":"21974"},{"ref":"21975"},{"ref":"21976"},{"ref":"21977"},{"ref":"21978"},{"ref":"19718"}],"tag":[{"k":"highway","v":"road"},{"k":"or_rdclass","v":"fmr"},{"k":"or_brgy","v":"Cantomimbo"},{"k":"name","v":"SAL-ING-CANTMIMBO-HAGUILANAN GRANDE RD."},{"k":"or_mun","v":"Balilihan"},{"k":"rd_cond","v":"excellent"},{"k":"source","v":"OpenRoads"}],"changeset":1}]},"delete":{"node":[{"id":"21852","lon":123.9780018,"lat":9.7923478,"version":"1","tag":[],"changeset":1}]}}},
  xml: '<osmChange version="0.1" generator="openroads-iD"><create/><modify><node id="21851" lon="123.9780018" lat="9.7923478" version="1" changeset="1"/><way id="21838" version="1" changeset="1"><nd ref="12482"/><nd ref="21839"/><nd ref="21840"/><nd ref="21841"/><nd ref="21842"/><nd ref="21843"/><nd ref="21844"/><nd ref="21845"/><nd ref="21846"/><nd ref="21847"/><nd ref="21848"/><nd ref="21849"/><nd ref="21850"/><nd ref="21851"/><nd ref="21853"/><nd ref="21854"/><nd ref="21855"/><nd ref="21856"/><nd ref="21857"/><nd ref="21858"/><nd ref="21859"/><nd ref="21860"/><nd ref="21861"/><nd ref="21862"/><nd ref="21863"/><nd ref="21864"/><nd ref="21865"/><nd ref="21866"/><nd ref="21867"/><nd ref="21868"/><nd ref="21869"/><nd ref="21870"/><nd ref="21871"/><nd ref="21872"/><nd ref="21873"/><nd ref="21874"/><nd ref="21875"/><nd ref="21876"/><nd ref="21877"/><nd ref="21878"/><nd ref="21879"/><nd ref="21880"/><nd ref="21881"/><nd ref="21882"/><nd ref="21883"/><nd ref="21884"/><nd ref="21885"/><nd ref="21886"/><nd ref="21887"/><nd ref="21888"/><nd ref="21889"/><nd ref="21890"/><nd ref="21891"/><nd ref="21892"/><nd ref="21893"/><nd ref="21894"/><nd ref="21895"/><nd ref="21896"/><nd ref="21897"/><nd ref="21898"/><nd ref="21899"/><nd ref="21900"/><nd ref="21901"/><nd ref="21902"/><nd ref="21903"/><nd ref="21904"/><nd ref="21905"/><nd ref="21906"/><nd ref="21907"/><nd ref="21908"/><nd ref="21909"/><nd ref="21910"/><nd ref="21911"/><nd ref="21912"/><nd ref="21913"/><nd ref="21914"/><nd ref="21915"/><nd ref="21916"/><nd ref="21917"/><nd ref="21918"/><nd ref="21919"/><nd ref="21920"/><nd ref="21921"/><nd ref="21922"/><nd ref="21923"/><nd ref="21924"/><nd ref="21925"/><nd ref="21926"/><nd ref="21927"/><nd ref="21928"/><nd ref="21929"/><nd ref="21930"/><nd ref="21931"/><nd ref="21932"/><nd ref="21933"/><nd ref="21934"/><nd ref="21935"/><nd ref="21936"/><nd ref="21937"/><nd ref="21938"/><nd ref="21939"/><nd ref="21940"/><nd ref="21941"/><nd ref="21942"/><nd ref="21943"/><nd ref="21944"/><nd ref="21945"/><nd ref="21946"/><nd ref="21947"/><nd ref="21948"/><nd ref="21949"/><nd ref="21950"/><nd ref="21951"/><nd ref="21952"/><nd ref="21953"/><nd ref="21954"/><nd ref="21955"/><nd ref="21956"/><nd ref="21957"/><nd ref="21958"/><nd ref="21959"/><nd ref="21960"/><nd ref="21961"/><nd ref="21962"/><nd ref="21963"/><nd ref="21964"/><nd ref="21965"/><nd ref="21966"/><nd ref="21967"/><nd ref="21968"/><nd ref="21969"/><nd ref="21970"/><nd ref="21971"/><nd ref="21972"/><nd ref="21973"/><nd ref="21974"/><nd ref="21975"/><nd ref="21976"/><nd ref="21977"/><nd ref="21978"/><nd ref="19718"/><tag k="highway" v="road"/><tag k="or_rdclass" v="fmr"/><tag k="or_brgy" v="Cantomimbo"/><tag k="name" v="SAL-ING-CANTMIMBO-HAGUILANAN GRANDE RD."/><tag k="or_mun" v="Balilihan"/><tag k="rd_cond" v="excellent"/><tag k="source" v="OpenRoads"/></way></modify><delete if-unused="true"><node id="21852" lon="123.9780018" lat="9.7923478" version="1" changeset="1"/></delete></osmChange>'
};
