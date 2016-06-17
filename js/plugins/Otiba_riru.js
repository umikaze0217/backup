//=============================================================================
// Otiba_riru.js
//=============================================================================
/*:
 * @plugindesc 落ち葉を降らせます
 * @author riru
 *
 * @param Otiba Pattern
 * @desc 落ち葉のパターン数（画像の行数）
 * @default 18
 *
 * @param Otiba Cell
 * @desc 落ち葉のセル数（画像の列数）
 * @default 5
 *
 * @param Otiba Number
 * @desc 落ち葉の表示数（多すぎると重くなる可能性があります）
 * @default 30
 *
 * @param Otiba Yure
 * @desc 落ち葉のゆれ具合（多いほど直線的に降り、0で逆向きにまっすぐ降ります。）
 * @default 3
 *
 * @help
 * 落ち葉プラグイン ver 1.01
 *
 *＜使い方＞
 *＜落ち葉を降らす＞
 *プラグインコマンドで「RiruOtiba start」（「」は不要）と記入。
 *
 *＜落葉を止める＞
 *一気に止める…プラグインコマンドで「RiruOtiba stop」（「」は不要）と記入。
 *フェードアウトで止める…プラグインコマンドで「RiruOtiba fadeout」（「」は不要）と記入。
 *
 *
 * ＜規約＞
 * 有償無償問わず使用できます。改変もご自由にどうぞ。仕様報告もいりません。２次配布はだめです
 *著作権は放棄していません。使用する場合は以下の作者とURLをreadmeなどどこかに記載してください
 *
 * ＜作者情報＞
 *作者：riru 
 *HP：ガラス細工の夢幻
 *URL：http://garasuzaikunomugen.web.fc2.com/index.html
 *
 * ＜更新情報＞
 *2016年1月20日　公開
 *1月21日　落ち葉の揺れ具合を設定可能に
 */
(function() {
    var parameters = PluginManager.parameters('Otiba_riru');
    var l_pattern = Number(parameters['Otiba Pattern'] || 5);
    var l_cell = Number(parameters['Otiba Cell'] || 18);
    var l_number = Number(parameters['Otiba Number'] || 30);
    var l_yure = Number(parameters['Otiba Yure'] || 3);
    var otiba_flug = false;//落葉中フラグ
    var otiba_fadeout = false;//フェードアウトフラグ
    var otiba_sprites = [];//落ち葉スプライト群
    var fadeout_sprite = 0;//透明化済みスプライト数
    
    var _riru_Game_InterpreterpluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _riru_Game_InterpreterpluginCommand.call(this, command, args);
        if (command === 'RiruOtiba') {
            switch (args[0]) {
               case 'start':
                   otiba_flug = true;
                   otiba_fadeout = false;
                   fadeout_sprite = 0;
                    break;
               case 'stop':
                    otiba_flug = false;
                    break;
               case 'fadeout':
                    otiba_fadeout = true;
                    break;
            }
        }
    };
function Sprite_Otiba() {
    this.initialize.apply(this, arguments);
}
Sprite_Otiba.prototype = Object.create(Sprite.prototype);
Sprite_Otiba.prototype.constructor = Sprite_Otiba;

Sprite_Otiba.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
    this.initMembers();
    this.setup();
};

Sprite_Otiba.prototype.initMembers = function() {
    this._base_x = 0;
    this._base_y = 0;
    this._time = 0;
    this._zoom = 0.0;
    this._otibatype = 0;
    this._otibacell = 0;
};
Sprite_Otiba.prototype.setup = function() {
    this.opacity = 255;
    this._base_x = Math.floor( Math.random() * 816 ) ;
    this._base_y = Math.floor( Math.random() * 624-100 );
    this._time = Math.floor( Math.random() * 200 ) + 50;
    this._zoom = Math.floor( Math.random() * 1.5 ) + 0.5;
    this._otibatype = Math.floor( Math.random() * l_pattern );
    this._otibacell = Math.floor( Math.random() * l_cell );
    this.setBitmap();
};
Sprite_Otiba.prototype.setBitmap = function() {
    this.bitmap = ImageManager.loadSystem("otiba");
    this.x = this._base_x;
    this.y = this._base_y;
    this.scale.x = this._zoom;
    this.scale.y = this._zoom;
    var width = this.bitmap.width/l_cell;
    var height = this.bitmap.height/l_pattern;
    var x = width*Math.floor(this._otibacell/5);
    var y = height*this._otibatype;
    this.setFrame(x, y, width, height);
};
Sprite_Otiba.prototype.update = function() {
    this._time--
    var width = this.bitmap.width/l_cell;
    var height = this.bitmap.height/l_pattern;
    var x = width*Math.floor(this._otibacell/5);
    var y = height*this._otibatype;
    this.setFrame(x, y, width, height);
    (this._otibacell >= (l_cell-1)*5) ? this._otibacell = 0 : this._otibacell++;
    var move_x = Math.floor( Math.random() * 2 ) + 1;
    var x_reverse = Math.floor( Math.random() * l_yure );//逆向きに移動判定
    (x_reverse <= 0) ? this.x += move_x : this.x -= move_x;
    var move_y = Math.floor( Math.random() * 3 ) + 1;
    this.y += move_y;
};
var _riru_Spriteset_Map_update = Spriteset_Map.prototype.update;
Spriteset_Map.prototype.update = function() {
    _riru_Spriteset_Map_update.call(this);
    this.updateOtiba();
};
Spriteset_Map.prototype.updateOtiba = function() {
  if (otiba_flug == true){
    if (otiba_sprites.length == 0||otiba_sprites == null){
      for (var i = 0; i < l_number; i++) {
        var sprite = new Sprite_Otiba();
       otiba_sprites.push(sprite); 
       this.addChild(otiba_sprites[i]);
      }
    }else{
      for (var i = 0; i < otiba_sprites.length; i++) {
        if (otiba_sprites[i]._time<=50){
          otiba_sprites[i].opacity -= 255/50;
        }  
        otiba_sprites[i].update();
        if (otiba_sprites[i]._time <= 0){
          if (otiba_fadeout != true){
            otiba_sprites[i].setup();
          }  
        }
      if (otiba_sprites[i].opacity <= 0) fadeout_sprite++;
      } 
    if (fadeout_sprite >= otiba_sprites.length-1) otiba_flug = false;
    }  
  }else{
    if (otiba_sprites.length != 0){
      for (var i = 0; i < otiba_sprites.length; i++) {
        this.removeChild(otiba_sprites[i]);
      } 
     otiba_sprites.length = 0;
    } 
  } 
};
var _riru_Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
Spriteset_Map.prototype.createLowerLayer = function() {
    _riru_Spriteset_Map_createLowerLayer.call(this);
    this.createfall_l();
};
Spriteset_Map.prototype.createfall_l = function() {
  if (otiba_flug == true&&otiba_sprites.length != 0){
    for (var i = 0; i < l_number; i++) {
       this.addChild(otiba_sprites[i]);
    } 
  } 
};

})();
