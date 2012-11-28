function MaterialEditor()
{
	
	$('#sidepanel').append("<div id='materialeditor'>" +
					"<div id='materialeditortitle' class='ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix' >Material Editor</div>"+
					"</div>");

	//$('#materialeditor').dialog({title:'Material Editor',autoOpen:false});
	
		$('#materialeditor').css('border-bottom','5px solid #444444')
		$('#materialeditor').css('border-left','2px solid #444444')
		
		
	$(document.head).append('<link rel="stylesheet" media="screen" type="text/css" href="css/colorpicker.css" />');
	$(document.head).append('<script type="text/javascript" src="js/colorpicker.js"></script>');
	
	this.show = function()
	{
		//$('#materialeditor').dialog('open');
		$('#materialeditor').prependTo($('#materialeditor').parent());
		$('#materialeditor').show('blind',function(){
		
		});
		showSidePanel();
		
		this.BuildGUI();
		//if(_PrimitiveEditor.isOpen())
			//$('#materialeditor').dialog('option','position',[1282,456]);
		//else
			//$('#materialeditor').dialog('option','position',[1282,40]);
		//this.open =true;
	}
	
	this.hide = function()
	{
		//$('#materialeditor').dialog('close');
		$('#materialeditor').hide('blind',function(){if(!$('#sidepanel').children().is(':visible'))
				hideSidePanel();});
		
	}
	
	this.isOpen = function()
	{
		//$("#materialeditor").dialog( "isOpen" )
		return $('#materialeditor').is(':visible');
	}
	this.RootPropTypein = function()
	{
		var prop = $(this).attr('prop');
		_MaterialEditor.currentMaterial[prop] = $('#'+prop+'value').val();
		$('#'+prop+'slider').slider('value',$('#'+prop+'value').val());
		_MaterialEditor.updateObject();
	}
	this.RootPropUpdate = function(e,ui)
	{
		var prop = $(this).attr('prop');
		_MaterialEditor.currentMaterial[prop] = ui.value;
		$('#'+prop+'value').val(ui.value);
		_MaterialEditor.updateObject();
	}
	this.LayerPropTypein = function()
	{
		var prop = $(this).attr('prop');
		var layer = $(this).attr('layer');
		var rootid = 'Layer'+layer+'Settings';
		_MaterialEditor.currentMaterial.layers[layer][prop] = $('#'+rootid+prop+'value').val();
		$('#'+rootid+prop+'slider').slider('value',$('#'+rootid+prop+'value').val());
		_MaterialEditor.updateObject();
	}
	this.LayerPropUpdate = function(e,ui)
	{
		var prop = $(this).attr('prop');
		var layer = $(this).attr('layer');
		var rootid = 'Layer'+layer+'Settings';
		_MaterialEditor.currentMaterial.layers[layer][prop] = ui.value;
		$('#'+rootid+prop+'value').val(ui.value);
		_MaterialEditor.updateObject();
	}
	
	this.updateObject = function()
	{
	
		
		if(document.PlayerNumber == null)
		{
			_Notifier.notify('You must log in to participate');
			return;
		}
		var owner = vwf.getProperty(_Editor.GetSelectedVWFNode().id,'owner');
		if(owner!=document.PlayerNumber)
		{
			_Notifier.notify('You do not own this object. It`s owned by '+ owner);
			return;
		}
		
		var id = _Editor.GetSelectedVWFNode().id;
		vwf_view.kernel.setProperty(id,'materialDef',_MaterialEditor.currentMaterial);
		
	}
	this.BuildGUI = function()
	{
		var sliderprops = [
		{prop:'alpha',min:0,max:1,step:.01},
		{prop:'specularLevel',min:0,max:10,step:.05},
		{prop:'reflect',min:0,max:10,step:.05},
		{prop:'shininess',min:0,max:10,step:.05}
		];
		$("#materialeditor").empty();
		$("#materialeditor").append("<div id='materialeditortitle' style = 'padding:3px 4px 3px 4px;font:1.5em sans-serif;font-weight: bold;' class='ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix' ><span class='ui-dialog-title' id='ui-dialog-title-Players'>Material Editor</span></div>");
		$('#materialeditortitle').append('<a href="#" id="materialeditorclose" class="ui-dialog-titlebar-close ui-corner-all" role="button" style="display: inline-block;float: right;"><span class="ui-icon ui-icon-closethick">close</span></a>');
		$('#materialeditortitle').prepend('<img class="headericon" src="images/icons/material.png" />');	
		$("#materialeditor").append(
					'<div id="materialaccordion" style="height:100%;overflow:hidden">'+
					'	<h3>'+
					'		<a href="#">Material Base</a>'+
					'	</h3>'+
					'	<div id="MaterialBasicSettings">'+
					'	</div>'+
					'</div>'
					);

		$("#materialeditorclose").click(function(){_MaterialEditor.hide()});
		for(var i = 0; i < sliderprops.length;i++)
		{
			var prop = sliderprops[i].prop;
			
			var inputstyle = "display: inline;float: right;padding: 0;width: 50px;border-radius: 6px;background: transparent;text-align: center;border-width: 1px;color: grey;"
			$('#MaterialBasicSettings').append('<div style="display:inline-block;margin-bottom: 3px;margin-top: 3px;">'+prop+': </div>');
			$('#MaterialBasicSettings').append('<input style="'+inputstyle+'" id="'+prop+'value"></input>');
			$('#'+prop+'value').change(this.RootPropTypein);
			$('#MaterialBasicSettings').append('<div id="'+prop+'slider"/>');
			$('#'+prop+'slider').attr('prop',prop);
			$('#'+prop+'value').attr('prop',prop);
			var val = this.currentMaterial[prop];
			$('#'+prop+'value').val(val);
			$('#'+prop+'slider').slider({step:sliderprops[i].step,min:sliderprops[i].min,max:sliderprops[i].max,slide:this.RootPropUpdate,stop:this.RootPropUpdate,value:val});
		}
		$('#MaterialBasicSettings').append('<div id="brightdiv" />');
		$('#brightdiv').append('<div style="display:inline-block;margin-bottom: 3px;margin-top: 3px;">Full Bright: </div>');
		$('#brightdiv').append('<select id="FullBright" style="float:right"><option value="true">true</option><option value="false">false</option></select>')
		$('#MaterialBasicSettings').append('<div id="shadowdiv" />');
		$('#shadowdiv').append('<div  style="display:inline-block;margin-bottom: 3px;margin-top: 3px;">Enable Shadows: </div>');
		$('#shadowdiv').append('<select id="Shadows" style="float:right;clear:right"><option value="true">true</option><option value="false">false</option></select>') 		
		$('#Shadows').val(this.currentMaterial.shadows + "");
		$('#FullBright').val(this.currentMaterial.shadeless + "");
		$('#FullBright').change(function(){
			
			_MaterialEditor.currentMaterial.shadeless = $(this).val() == 'true';
			_MaterialEditor.updateObject();
		});
		$('#Shadows').change(function(){
			_MaterialEditor.currentMaterial.shadows = $(this).val() == 'true';
			_MaterialEditor.updateObject();
		});
		
		var colorswatchstyle = "margin: 5px;float:right;clear:right;background-color: #FF19E9;width: 25px;height: 25px;border: 2px solid lightgray;border-radius: 3px;display: inline-block;margin-left: 20px;vertical-align: middle;box-shadow: 2px 2px 5px,1px 1px 3px gray inset;background-image: url(../images/select3.png);background-position: center;";
		$('#MaterialBasicSettings').append('<div />');
		$('#MaterialBasicSettings').append('<div style="margin-bottom:10px" id="colordiv" />');
		$('#colordiv').append('<div style="display:inline-block;margin-bottom: 3px;margin-top: 15px;">Diffuse Color: </div>');
		$('#colordiv').append('<div id="ColorColorPicker" style="'+colorswatchstyle+'"></div>')
		var col =this.currentMaterial.color;
		$('#ColorColorPicker').css('background-color','rgb('+Math.floor(col.r*255)+','+Math.floor(col.g*255)+','+Math.floor(col.b*255)+')');
		$('#ColorColorPicker').ColorPicker({onShow:function(e){$(e).fadeIn();},onHide:function(e){$(e).fadeOut();return false},
		onSubmit:function(hsb, hex, rgb)
		{
			
			$('#ColorColorPicker').css('background-color',"#"+hex);
			_MaterialEditor.currentMaterial.color.r = rgb.r/255;
			_MaterialEditor.currentMaterial.color.g = rgb.g/255;
			_MaterialEditor.currentMaterial.color.b = rgb.b/255;
			_MaterialEditor.updateObject();
		
		},onChange:function(hsb, hex, rgb)
		{
			$('#ColorColorPicker').css('background-color',"#"+hex);
			_MaterialEditor.currentMaterial.color.r = rgb.r/255;
			_MaterialEditor.currentMaterial.color.g = rgb.g/255;
			_MaterialEditor.currentMaterial.color.b = rgb.b/255;
			_MaterialEditor.updateObject();
		}
		
		});
		$('#MaterialBasicSettings').append('<div />');
		$('#MaterialBasicSettings').append('<div style="margin-bottom:10px" id="ambientdiv" />');
		$('#ambientdiv').append('<div style="display:inline-block;margin-bottom: 3px;margin-top: 15px;">Ambient Color: </div>');
		$('#ambientdiv').append('<div id="AmbientColorPicker" style="'+colorswatchstyle+'"></div>')
		var amb =this.currentMaterial.ambient;
		$('#AmbientColorPicker').css('background-color','rgb('+Math.floor(amb.r*255)+','+Math.floor(amb.g*255)+','+Math.floor(amb.b*255)+')');
		$('#AmbientColorPicker').ColorPicker({onShow:function(e){$(e).fadeIn();},onHide:function(e){$(e).fadeOut();return false},
		
		onSubmit:function(hsb, hex, rgb)
		{
			
			$('#AmbientColorPicker').css('background-color',"#"+hex);
			_MaterialEditor.currentMaterial.ambient.r = rgb.r/255;
			_MaterialEditor.currentMaterial.ambient.g = rgb.g/255;
			_MaterialEditor.currentMaterial.ambient.b = rgb.b/255;
			_MaterialEditor.updateObject();
		
		
		},onChange:function(hsb, hex, rgb)
		{
			$('#AmbientColorPicker').css('background-color',"#"+hex);
			_MaterialEditor.currentMaterial.ambient.r = rgb.r/255;
			_MaterialEditor.currentMaterial.ambient.g = rgb.g/255;
			_MaterialEditor.currentMaterial.ambient.b = rgb.b/255;
			_MaterialEditor.updateObject();
		}
		
		});
		$('#MaterialBasicSettings').append('<div />');
		$('#MaterialBasicSettings').append('<div style="margin-bottom:10px" id="emitdiv" />');
		$('#emitdiv').append('<div style="display:inline-block;margin-bottom: 3px;margin-top: 15px;">Emission Color: </div>');
		$('#emitdiv').append('<div id="EmitColorPicker" style="'+colorswatchstyle+'"></div>')
		var emt =this.currentMaterial.emit;
		$('#EmitColorPicker').css('background-color','rgb('+Math.floor(emt.r*255)+','+Math.floor(emt.g*255)+','+Math.floor(emt.b*255)+')');
		$('#EmitColorPicker').ColorPicker({onShow:function(e){$(e).fadeIn();},onHide:function(e){$(e).fadeOut();return false},
		
		onSubmit:function(hsb, hex, rgb)
		{
			
			$('#EmitColorPicker').css('background-color',"#"+hex);
			_MaterialEditor.currentMaterial.emit.r = rgb.r/255;
			_MaterialEditor.currentMaterial.emit.g = rgb.g/255;
			_MaterialEditor.currentMaterial.emit.b = rgb.b/255;
			_MaterialEditor.updateObject();
		
		
		},onChange:function(hsb, hex, rgb)
		{
			$('#EmitColorPicker').css('background-color',"#"+hex);
			_MaterialEditor.currentMaterial.emit.r = rgb.r/255;
			_MaterialEditor.currentMaterial.emit.g = rgb.g/255;
			_MaterialEditor.currentMaterial.emit.b = rgb.b/255;
			_MaterialEditor.updateObject();
		}
		
		});
		
		$('#MaterialBasicSettings').append('<div />');
		$('#MaterialBasicSettings').append('<div style="margin-bottom:10px" id="specdiv" />');
		$('#specdiv').append('<div style="display:inline-block;margin-bottom: 3px;margin-top: 15px;">Specular Color: </div>');
		$('#specdiv').append('<div id="SpecColorPicker" style="'+colorswatchstyle+'"></div>')
		var spec =this.currentMaterial.specularColor;
		$('#SpecColorPicker').css('background-color','rgb('+Math.floor(spec.r*255)+','+Math.floor(spec.g*255)+','+Math.floor(spec.b*255)+')');
		$('#SpecColorPicker').ColorPicker({onShow:function(e){$(e).fadeIn();},onHide:function(e){$(e).fadeOut();return false},
		
		onSubmit:function(hsb, hex, rgb)
		{
			
			$('#SpecColorPicker').css('background-color',"#"+hex);
			_MaterialEditor.currentMaterial.specularColor.r = rgb.r/255;
			_MaterialEditor.currentMaterial.specularColor.g = rgb.g/255;
			_MaterialEditor.currentMaterial.specularColor.b = rgb.b/255;
			_MaterialEditor.updateObject();
		
		
		},onChange:function(hsb, hex, rgb)
		{
			$('#SpecColorPicker').css('background-color',"#"+hex);
			_MaterialEditor.currentMaterial.specularColor.r = rgb.r/255;
			_MaterialEditor.currentMaterial.specularColor.g = rgb.g/255;
			_MaterialEditor.currentMaterial.specularColor.b = rgb.b/255;
			_MaterialEditor.updateObject();
		}
		
		});
		
		$('#'+'MaterialBasicSettings').append('<div id="MaterialBasicSettingsnewLayer" style=width:100%;margin-top:10px/>');
		$('#'+'MaterialBasicSettingsnewLayer').button({label:'Add Layer'});
		$('#'+'MaterialBasicSettingsnewLayer').click(this.addLayer);
		
		for(var i = 0; i < this.currentMaterial.layers.length; i++)
		{
		    
			$('#materialaccordion').append('	<h3>'+
					'		<a href="#">Texture Layer '+i+'</a>'+
					'	</h3>'+
					'	<div id="Layer'+i+'Settings">'+
					'	</div>'
				);
			var layer = this.currentMaterial.layers[i];
			var rootid = 'Layer'+i+'Settings';
		
			$('#'+rootid).append('<img id="'+rootid+'thumb" class="BigTextureThumb"/>');
			$('#'+rootid+'thumb').attr('src',this.currentMaterial.layers[i].src);
			$('#'+rootid).append('<div id="'+rootid+'thumbsrc" class="BigTextureThumb" style="overflow:hidden; text-overflow:ellipsis; text-align: center;font-weight: bold;border: none;"/>');
			$('#'+rootid+'thumbsrc').html(this.currentMaterial.layers[i].src);
			
			$('#'+rootid+'thumb').attr('layer',i);
			$('#'+rootid+'thumb').click(function(){
				_MaterialEditor.activeTexture = $(this).attr('layer');
				_MapBrowser.show();
			});
			
			var layersliderprops = [
			{prop:'alpha',min:0,max:1,step:.01},
			{prop:'scalex',min:-10,max:10,step:.1},
			{prop:'scaley',min:-10,max:10,step:.1},
			{prop:'offsetx',min:-1,max:1,step:.01},
			{prop:'offsety',min:-1,max:1,step:.01},
			{prop:'rot',min:-2,max:2,step:.01}
			];
				
			for(var j = 0; j < layersliderprops.length;j++)
			{
				var prop = layersliderprops[j].prop;
				
				var inputstyle = "display: inline;float: right;padding: 0;width: 50px;border-radius: 6px;background: transparent;text-align: center;border-width: 1px;color: grey;"
				$('#'+rootid).append('<div style="display:inline-block;margin-bottom: 3px;margin-top: 3px;">'+prop+': </div>');
				$('#'+rootid).append('<input style="'+inputstyle+'" id="'+rootid+prop+'value"></input>');
				$('#'+rootid+prop+'value').change(this.LayerPropTypein);
				$('#'+rootid).append('<div id="'+rootid+prop+'slider"/>');
				$('#'+rootid+prop+'slider').attr('prop',prop);
				$('#'+rootid+prop+'value').attr('prop',prop);
				$('#'+rootid+prop+'slider').attr('layer',i);
				$('#'+rootid+prop+'value').attr('layer',i);
				var val = this.currentMaterial.layers[i][prop];
				$('#'+rootid+prop+'value').val(val);
				$('#'+rootid+prop+'slider').slider({step:layersliderprops[j].step,min:layersliderprops[j].min,max:layersliderprops[j].max,slide:this.LayerPropUpdate,stop:this.LayerPropUpdate,value:val});
			}
			
			
			
			$('#'+rootid).append('<div style="clear:right" id="'+rootid+'mapToDiv" />');
			$('#'+rootid+'mapToDiv').append('<div  style="display:inline-block;margin-bottom: 3px;margin-top: 3px;">Map To Property: </div>');
			$('#'+rootid+'mapToDiv').append('<select id="'+rootid+'mapTo" style="float:right;clear:right">'+
			'<option value="1">Diffuse Color</option>'+
			'<option value="256">Alpha</option>'+
			'<option value="16384">Ambient</option>'+
			'<option value="128">Emit</option>'+
			'<option value="8192">Height</option>'+
			'<option value="4096">Mask A</option>'+
			'<option value="512">Mask R</option>'+
			'<option value="1024">Mask G</option>'+
			'<option value="2048">Mask B</option>'+
			'<option value="2">Normal</option>'+
			'<option value="64">Reflect</option>'+
			'<option value="32">Shine</option>'+
			'<option value="8">Spec Color</option>'+
			'<option value="16">Specular</option>'+
			'<option value="32768">Steep</option>'+
			'</select>');
			
			$('#'+rootid+'mapTo').val(this.currentMaterial.layers[i].mapTo + "");
			$('#'+rootid+'mapTo').attr('layer',i);
			$('#'+rootid+'mapTo').change(function(){
				
				_MaterialEditor.currentMaterial.layers[$(this).attr('layer')].mapTo = $(this).val();
				_MaterialEditor.updateObject();
			});
			
			
			$('#'+rootid).append('<div style="clear:right" id="'+rootid+'mapInputDiv" />');
			$('#'+rootid+'mapInputDiv').append('<div  style="display:inline-block;margin-bottom: 3px;margin-top: 3px;">Coord Type: </div>');
			$('#'+rootid+'mapInputDiv').append('<select id="'+rootid+'mapInput" style="float:right;clear:right">'+
			'<option value="0">UV 1</option>'+
			'<option value="1">UV 2</option>'+
			'<option value="6">Environment</option>'+
			'<option value="3">Normal</option>'+
			'<option value="4">Object</option>'+
			'<option value="5">Reflection</option>'+
			'<option value="7">View</option>'+
			'</select>');
			
			
			
			$('#'+rootid+'mapInput').val(this.currentMaterial.layers[i].mapTo + "");
			$('#'+rootid+'mapInput').attr('layer',i);
			$('#'+rootid+'mapInput').change(function(){
				
				_MaterialEditor.currentMaterial.layers[$(this).attr('layer')].mapInput = $(this).val();
				_MaterialEditor.updateObject();
			});
			
			
			
			$('#'+rootid).append('<div style="clear:right" id="'+rootid+'blendModeDiv" />');
			$('#'+rootid+'blendModeDiv').append('<div  style="display:inline-block;margin-bottom: 3px;margin-top: 3px;">Blend Mode: </div>');
			$('#'+rootid+'blendModeDiv').append('<select id="'+rootid+'blendMode" style="float:right;clear:right">'+
			'<option value="0">Multiply</option>'+
			'<option value="1">Mix</option>'+
			'</select>');
			
			$('#'+rootid+'blendMode').val(this.currentMaterial.layers[i].mapTo + "");
			$('#'+rootid+'blendMode').attr('layer',i);
			$('#'+rootid+'blendMode').change(function(){
				
				_MaterialEditor.currentMaterial.layers[$(this).attr('layer')].blendMode = $(this).val();
				_MaterialEditor.updateObject();
			});
		
			$('#'+rootid).append('<div id="'+rootid+'deleteLayer" style="width: 100%;margin-top: 10px;"/>');
			
			$('#'+rootid+'deleteLayer').button({label:'Delete Layer'});
			
			$('#'+rootid+'deleteLayer').attr('layer',i);
			$('#'+rootid+'deleteLayer').click(this.deletelayer);
			

		}
		
		
		$( "#materialaccordion" ).accordion({
			fillSpace:true,
			heightStyle: "content"
		});
		
		$( ".ui-accordion-content").css('height','auto');
		
		//$('#materialeditor').resizable({
        //    maxHeight: 550,
        //    maxWidth: 320,
        //    minHeight: 150,
        //    minWidth: 320
        //});
		
	}
	this.setActiveTextureSrc = function(e)
	{
		var i = this.activeTexture;
		var rootid = 'Layer'+i+'Settings';
		$('#'+rootid+"thumbsrc").html(e);
		$('#'+rootid+"thumb").attr('src',e);
		$('#Layer'+i+'Settingsthumb').attr('class','');
		window.setTimeout(function(){		
		$('#Layer'+i+'Settingsthumb').attr('class','BigTextureThumb');
		},10);
		this.currentMaterial.layers[i].src = e;
		this.updateObject();
	}
	this.deletelayer = function()
	{
		var layer = $(this).attr('layer');
		_MaterialEditor.currentMaterial.layers.splice(layer,1);
		_MaterialEditor.updateObject();
		_MaterialEditor.BuildGUI();
	}
	this.addLayer = function()
	{
		var newlayer = {};
		newlayer.offsetx = 0;
		newlayer.offsety = 0;
		newlayer.scalex = 1;
		newlayer.scaley = 1;
		newlayer.rot = 0;
		newlayer.blendMode = 0;
		newlayer.mapTo = 1;
		newlayer.mapInput = 0;
		newlayer.alpha = 1;
		newlayer.src = 'checker.jpg';
		
		_MaterialEditor.currentMaterial.layers.push(newlayer);
		_MaterialEditor.updateObject();
		_MaterialEditor.BuildGUI();
	}
	this.SelectionChanged = function(e,node)
	{
		try{
			
			if(node)
			{
				this.currentMaterial = vwf.getProperty(node.id,'materialDef');
				if(!this.currentMaterial)
					return;
				this.BuildGUI();
			}
		}
		catch(e)
		{
			 console.log(e);
		}
	}
	$(document).bind('selectionChanged',this.SelectionChanged.bind(this));
}

function MapBrowser()
{
	
	$(document.body).append("<div id='MapBrowser' />");
	$(document.body).append("<div id='AddMap'> <input type='text' id='newmapurl' /> </div>");
	$('#MapBrowser').dialog({title:'Map Broser',autoOpen:false,modal:true});
	$('#AddMap').dialog({title:'Add Map',autoOpen:false,modal:true, buttons:{
		'Ok':function()
		{
			_TextureList.push({texture:$('#newmapurl').val(),thumb:$('#newmapurl').val()});
			$('#AddMap').dialog('close');
		},
		'Cancel':function(){
			$('#AddMap').dialog('close');
		}
	}});
	$(document.head).append('<script type="text/javascript" src="textures/textureLibrary.js"></script>');
	
	this.texturePicked = function()
	{
		
		var texture = $(this).attr('texture');
		_MaterialEditor.setActiveTextureSrc(texture);
	}
	
	this.BuildGUI = function()
	{
		$('#MapBrowser').empty();
		for(var i = 0; i < _TextureList.length; i++)
		{
		
			$('#MapBrowser').append('<img id="MapChoice'+i+'" class="textureChoice" />');
			$('#MapChoice'+i).attr('src',_TextureList[i].thumb);
			$('#MapChoice'+i).attr('texture',_TextureList[i].texture);
			$('#MapChoice'+i).click(this.texturePicked);
		}
		$('#MapBrowser').append('<img id="MapChoiceadd" class="textureChoice" src="images/plus.png" />');
		$('#MapChoiceadd').click(this.addTextureURLClick);
	}
	this.addTextureURLClick = function()
	{
		$('#AddMap').dialog('open');
	}
	this.show = function()
	{
		this.BuildGUI();
		$('#MapBrowser').dialog('open');
		$('#MapBrowser').dialog('option','position','center');
		this.open =true;
	}
	
	this.hide = function()
	{
		$('#MapBrowser').dialog('close');
		
	}
	
	this.isOpen = function()
	{
		$("#MapBrowser").dialog( "isOpen" )
	}
}
_MapBrowser = new MapBrowser();
_MaterialEditor = new MaterialEditor();
_MaterialEditor.hide();