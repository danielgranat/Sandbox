define(['vwf/view/editorview/lib/angular','vwf/view/editorview/strToBytes'], function(angular, strToBytes)
{
	var app = angular.module('ManageAssetsDialog', []);
	var dataRoot = null;
	var appPath = '';

	var uploadVWFObject;

	app.factory('DataManager', ['$rootScope','$http', function($rootScope, $http)
	{
		dataRoot = $rootScope;
		$rootScope.appPath = appPath;
		$rootScope.fields = {selected: null};
		$rootScope.assets = {};

		$rootScope.refreshData = function(id)
		{
			function updateAsset(id){
				$http.get($rootScope.appPath+'/assets/'+id+'/meta?permFormat=json').success(function(data){
					$rootScope.assets[id] = data;
					$rootScope.assets[id].id = id;
				})
				.error(function(data,status){
					if(status === 404){
						delete $rootScope.assets[id];
					}
				});
			}

			if(id && typeof(id) === 'string'){
				updateAsset(id);
			}
			else {
				$http.get($rootScope.appPath+'/assets/by-user/'+_UserManager.GetCurrentUserName()).success(
					function(list)
					{
						$rootScope.assets = {};
						for(var id in list.assets){
							updateAsset(id);
						}
					}
				);
			}
		}

		return null;
	}]);

	app.filter('sortKeys', function(){
		return function(input, field, reverse)
		{
			input = input || {};
			field = field || 'last_modified';
			reverse = reverse === undefined ? true : false;

			var out = [];
			for(var i in input){
				out.push(input[i]);
			}

			out.sort(function(a,b){
				var ret = 0;
				if(a[field] < b[field]) ret =  -1;
				else if(a[field] == b[field]) ret =  0;
				else ret =  1;
				return reverse ? -ret : ret;
			});

			return out;
		};
	});

	app.filter('filterThumbs', function(){
		return function(input, enabled)
		{
			if(enabled)
			{
				var thumbs = [];

				// gather list of thumbnails
				for(var i=0; i<input.length; i++)
				{
					if(input[i].thumbnail && input[i].thumbnail !== 'asset:'+input[i].id){
						thumbs.push(input[i].thumbnail.slice(6));
					}
				}

				return input.filter(function(val){ return thumbs.indexOf(val.id) === -1; });
			}
			else return input;
		};
	});

	app.filter('searchFor', function(){
		return function(input,term)
		{
			var re = new RegExp(term, 'i');
			return input.filter(function(item){
				return re.test(item.id) || re.test(item.type) || re.test(item.name) || re.test(item.description)
			});
		};
	});

	app.controller('AssetListController', ['$scope','$rootScope','DataManager', function($scope,$rootScope)
	{
		$scope.hideThumbs = true;

		$scope.prettifyType = function(type){
			switch(type){
				case 'application/vnd.vws-entity+json':
					return 'Sandbox Entity';
				case 'application/vnd.vws-material+json':
					return 'Sandbox Material';
				case 'application/vnd.vws-behavior+json':
					return 'Sandbox Behavior';
				default:
					return type;
			}
		}
	}]);

	app.controller('AssetPropertiesController', ['$scope','$rootScope','$http','DataManager', function($scope,$rootScope,$http)
	{
		// build resonable defaults for new uploads
		$scope.resetNew = function(){
			$scope.new = {
				permissions: {
					user: {
						read: true,
						write: true,
						delete: true
					},
					group: {
						read: true
					},
					other: {
						read: true
					}
				}
			};

			if($scope.fields.selected === 'new')
				$scope.selected = $scope.new;
		}
		$scope.resetNew();


		// keep 'selected' in sync with currently selected asset
		$scope.$watchGroup(['fields.selected', 'assets[fields.selected]'], function(newvals)
		{
			$scope.clearFileInput();

			if( newvals[0] ){
				if(newvals[0] !== 'new')
					$scope.selected = newvals[1];
				else
					$scope.selected = $scope.new;
			}
			else
				$scope.selected = {};
		});


		// roll up the various dirty flags into an asset-level one
		$scope.$watchGroup(['selected._basicDirty','selected._groupDirty','selected._permsDirty'], function(newvals){
			if($scope.selected)
				$scope.selected._dirty = newvals[0] || newvals[1] || newvals[2];
		});

		
		$scope.$watch('selected.thumbnail', function(newval){
			if($scope.selected && newval)
				$scope.selected._thumbnailId = newval.slice(6);
		});
		$scope.$watch('selected._thumbnailId', function(newval){
			if( $scope.selected && newval !== undefined ){
				if(newval)
					$scope.selected.thumbnail = 'asset:'+newval;
				else
					$scope.selected.thumbnail = null;
			}
		});

		// auto-fill mime type field when file is selected
		window.getFileData = function(files)
		{
			if(files[0])
			{
				var fr = new FileReader();
				fr.onloadend = function(evt)
				{
					$scope.selected.filename = files[0].name;
					$scope.selected.filedata = new Uint8Array(fr.result);

					if(files[0].type){
						$scope.selected.type = files[0].type;
					}
					else if(/\.dae$/i.test(files[0].name)){
						$scope.selected.type = 'model/vnd.collada+xml';
					}
					else if(/\.json$/i.test(files[0].name)){
						$scope.selected.type = 'application/json';
					}
					else {
						$scope.selected.type = '';
					}
					$scope.selected._dirty = true;
					$scope.$apply();
				};
				fr.readAsArrayBuffer(files[0]);
			}
		}

		uploadVWFObject = function(name, data, type, existingId, cb)
		{
			var cleanObj = _DataManager.getCleanNodePrototype(data);

			if(!existingId)
			{
				$scope.resetNew();
				$scope.fields.selected = 'new';
				$scope.new.filedata = strToBytes( JSON.stringify(cleanObj) );
				$scope.new.filename = name;
				$scope.new.type = type;
				$scope.new._dirty = true;
				$scope.new._uploadCallback = cb;
			}
			else
			{
				console.log(existingId);
				console.log($scope.assets);
				$scope.fields.selected = existingId;
				$scope.assets[existingId].filedata = strToBytes( JSON.stringify(cleanObj) );
				$scope.assets[existingId].filename = name;
				$scope.assets[existingId].type = type;
				$scope.assets[existingId]._dirty = true;
				$scope.assets[existingId]._uploadCallback = cb;
			}

			$scope.$apply();
		}

		// since file inputs are read-only...
		$scope.clearFileInput = function(){
			var input = $('#manageAssetsDialog #fileInput');
			input.replaceWith( input.val('').clone(true) );
		}


		// generate octal perms from checkbox array
		$scope.getPackedPermissions = function(){
			var perms = 0;
			if($scope.selected.permissions.user){
				perms = perms |
					$scope.selected.permissions.user.read * 0400 |
					$scope.selected.permissions.user.write * 0200 |
					$scope.selected.permissions.user.delete * 0100;
			}
			if($scope.selected.permissions.group){
				perms = perms |
					$scope.selected.permissions.group.read * 0040 |
					$scope.selected.permissions.group.write * 0020 |
					$scope.selected.permissions.group.delete * 0010;
			}
			if($scope.selected.permissions.other){
				perms = perms |
					$scope.selected.permissions.other.read * 0004 |
					$scope.selected.permissions.other.write * 0002 |
					$scope.selected.permissions.other.delete * 0001;
			}

			return perms;
		}


		// write asset data to the server
		$scope.saveData = function(id)
		{
			if( !id || id === 'new' )
			{
				if( $scope.selected.filedata )
				{
					var perms = $scope.getPackedPermissions();

					var url = $scope.appPath+'/assets/new';
					var queryChar = '?';
					if( $scope.selected.name ){
						url += queryChar+'name='+ encodeURIComponent( $scope.selected.name );
						queryChar = '&';
					}
					if( $scope.selected.description ){
						url += queryChar+'description='+ encodeURIComponent( $scope.selected.description );
						queryChar = '&';
					}
					if( $scope.selected.group_name ){
						url += queryChar+'group_name='+ encodeURIComponent( $scope.selected.group_name );
						queryChar = '&';
					}
					if( perms ){
						url += queryChar+'permissions='+ perms.toString(8);
						queryChar = '&';
					}
					if( $scope.selected.type.slice(0,6) === 'image/' && $scope.selected.filedata.byteLength < 30000 ){
						url += queryChar+'thumbnail='+ encodeURIComponent(':self');
						queryChar = '&';
					}

					var xhr = new XMLHttpRequest();
					xhr.addEventListener('loadend', function(e)
					{
						if(xhr.status === 201)
						{
							if($scope.selected._uploadCallback)
								$scope.selected._uploadCallback(xhr.responseText);

							$scope.refreshData(xhr.responseText);
							$scope.fields.selected = xhr.responseText;
							$scope.resetNew();
							$scope.clearFileInput();
						}
						else {
							alertify.alert('Upload failed: '+ xhr.responseText);
						}
					});

					xhr.open('POST', url);
					xhr.setRequestHeader('Content-Type', $scope.selected.type);
					xhr.send($scope.selected.filedata);

				}
				else {
					alertify.alert('You must select a file to upload');
				}
			}
			else
			{
				var toComplete = 0;

				function checkRemaining(){
					toComplete -= 1;
					if( toComplete === 0 ){
						$scope.refreshData($scope.selected.id);
					}
				}

				if( $scope.selected.filedata )
				{
					toComplete += 1;

					var xhr = new XMLHttpRequest();
					xhr.addEventListener('loadend', function(e)
					{
						if( xhr.status !== 200 ){
							alertify.alert('Upload failed: '+xhr.responseText);
						}
						else {
							$scope.clearFileInput();
						}
						checkRemaining();
					});
					xhr.open('POST', $scope.appPath+'/assets/'+$scope.selected.id);
					xhr.setRequestHeader('Content-Type', $('#manageAssetsDialog input#typeInput').val());

					xhr.send($scope.selected.filedata);
				}

				if($scope.selected._basicDirty)
				{
					toComplete += 1;
					var meta = {name: $scope.selected.name, description: $scope.selected.description, thumbnail: $scope.selected.thumbnail};
					$http.post($scope.appPath+'/assets/'+$scope.selected.id+'/meta', meta).success(checkRemaining)
					.error(function(data,status){
						alertify.alert('Failed to post metadata: '+data);
						checkRemaining();
					});
				}

				if($scope.selected._groupDirty)
				{
					toComplete += 1;
					$http.post($scope.appPath+'/assets/'+$scope.selected.id+'/meta/group_name', $scope.selected.group_name).success(checkRemaining)
					.error(function(data,status){
						alertify.alert('Failed to change group: '+data);
						checkRemaining();
					});
				}

				if($scope.selected._permsDirty)
				{
					var perms = $scope.getPackedPermissions();
					toComplete += 1;
					$http.post($scope.appPath+'/assets/'+$scope.selected.id+'/meta/permissions', perms.toString(8)).success(checkRemaining)
					.error(function(data,status){
						alertify.alert('Failed to change permissions: '+data);
						checkRemaining();
					});
				}
			}
		}

		$scope.deleteData = function(id)
		{
			alertify.confirm('Are you POSITIVE you want to delete this asset?', function()
			{
				$http.delete($scope.appPath+'/assets/'+id)
				.success(function(){
					$scope.refreshData(id);
					$scope.fields.selected = null;
				})
				.error(function(data){
					alertify.alert('Delete failed: '+data);
					$scope.refreshData(id);
					$scope.fields.selected = null;
				});
			});
		}

	}]);

	function nodeInherits(node, ancestor)
	{
		if(!node)
			return false;
		else if(node == ancestor)
			return true;
		else
			return nodeInherits( vwf.prototype(node), ancestor );
	}

	return {

		initialize: function()
		{
			// actually insert the html
			$("<link rel='stylesheet' href='vwf/view/editorview/css/assets.css'/>").appendTo(document.head);
			$('<div id="manageAssetsContainer"></div>').appendTo(document.body);
			$('#manageAssetsContainer').load('vwf/view/editorview/manageAssets.html',function()
			{
				$('#manageAssetsDialog').dialog({
					title: 'Manage Assets',
					width: 600,
					height: 600,
					autoOpen: false
				});

				$.get('vwfDataManager.svc/saspath', function(data){
					appPath = data;
					angular.bootstrap($('#manageAssetsDialog')[0], ['ManageAssetsDialog']);
				});
			});
		},

		refreshData: function(){
			dataRoot.refreshData();
		},

		uploadSelectedEntity: function(overwrite)
		{
			var nodeId = _Editor.GetSelectedVWFID();
			var node = vwf.getNode(nodeId);
			if(node){
				uploadVWFObject(
					node.properties.DisplayName,
					node,
					'application/vnd.vws-entity+json',
					overwrite ? node.properties.sourceAssetId : null,
					function(id){
						vwf_view.kernel.setProperty(nodeId, 'sourceAssetId', id);
					}
				);
			}
		},

		uploadSelectedMaterial: function(overwrite)
		{
			var nodeId = _Editor.GetSelectedVWFID();
			var node = vwf.getNode(nodeId);
			if(node && node.properties.materialDef){
				uploadVWFObject(
					node.properties.DisplayName+' material',
					node.properties.materialDef,
					'application/vnd.vws-material+json',
					overwrite ? node.properties.materialDef.sourceAssetId : null,
					function(id){
						var materialDef = node.properties.materialDef;
						materialDef.sourceAssetId = id;
						vwf_view.kernel.setProperty(nodeId, 'materialDef', materialDef);
					}
				);
			}
		},

		uploadSelectedBehavior: function(overwrite)
		{
			var nodeId = _Editor.GetSelectedVWFID();
			var node = vwf.getNode(nodeId);
			if(nodeId && nodeInherits(nodeId, 'http://vwf.example.com/behavior.vwf')){
				uploadVWFObject(
					node.properties.DisplayName,
					node,
					'application/vnd.vws-behavior+json',
					overwrite ? node.properties.sourceAssetId : null,
					function(id){
						vwf_view.kernel.setProperty(nodeId, 'sourceAssetId', id);
					}
				);
			}
		}
	};
	
});