
/*
  BLE Central 
  
  This example uses Don Coleman's BLE Central Plugin for Apache Cordova
  to create a central server that connects and sends data to the Light Blue Bean. 
  
  created 29 Mar 2015
  by Maria Paula Saba
*/



/* global mainPage, deviceList, refreshButton */
/* global connectedPage, resultDiv, messageInput, sendButton, disconnectButton */
/* global ble  */
/* jshint browser: true , devel: true*/
'use strict';

var DEVICE = 'MyBean';
var scratchServiceUUID = 'A495FF20-C5B1-4B44-B512-1370F02D74DE';
var scratchCharacteristicUUID = 'A495FF21-C5B1-4B44-B512-1370F02D74DE';


var app = {
	initialize: function() {
		this.bindEvents(); //binding event listeners to DOM in the app
		connectedPage.hidden = true; //hides the HTML elements for the second page
	},
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false); //runs onDeviceReady function whenever the device is ready (loaded)
		refreshButton.addEventListener('touchstart', this.refreshDeviceList, false); //on touch of the Refresh button, runs refreshDeviceList function
		deviceList.addEventListener('touchstart', this.connect, false); //on touch of device list, connect to device
		randomButton.addEventListener('touchstart', this.sendData, false);
		disconnectButton.addEventListener('touchstart', this.disconnect, false);
	},

	onDeviceReady: function() {
		app.refreshDeviceList();
	},

	refreshDeviceList: function() {
		deviceList.innerHTML = ''; // empties the list
		ble.scan([], 5, app.onDiscoverDevice, app.onError); //scans for BLE devices
	},

	onDiscoverDevice: function(device) {
		//only shows devices with the name we're looking for
		if(device.name === DEVICE) {
			//creates a HTML element to display in the app
			var listItem = document.createElement('li'),
			html = '<b>' + device.name + '</b><br/>' +
			'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
			device.id;
			listItem.innerHTML = html;
			listItem.dataset.deviceId = device.id;         //save the device ID in the DOM element
			listItem.setAttribute("class", "result");      //give the element a class for css purposes
			deviceList.appendChild(listItem);              //attach it in the HTML element called deviceList
		}

	},

	connect: function(e) {
		//get the device ID from the DOM element
		var deviceId = e.target.dataset.deviceId,

		onConnect = function() {
			//saves device ID to buttons - needed later
			disconnectButton.dataset.deviceId = deviceId;
			randomButton.dataset.deviceId = deviceId;

			resultDiv.innerHTML = "Click to send data";

			//show next page
			app.showConnectPage();
		};

		//connect functions asks for the device id, a callback function for when succeeds and one error functions for when it fails
		ble.connect(deviceId, onConnect, app.onError);
	},
	sendData: function() { 
        var deviceId = event.target.dataset.deviceId;
		var r = Math.random()*255;
		var g = Math.random()*255;
		var b = Math.random()*255;  

		var data = new Uint8Array(3);
		data[0] = r;
		data[1] = g;
		data[2] = b;
		
    	// send data to the bean
		ble.write(deviceId, scratchServiceUUID, scratchCharacteristicUUID, data.buffer, app.onSuccess(data), app.onError);
	},

	disconnect: function(event) {
		//gets device ID from disconnect button
		var deviceId = event.target.dataset.deviceId;
		ble.disconnect(deviceId, app.showStartPage, app.onError);
	},
	showStartPage: function() {
		startPage.hidden = false;
		connectedPage.hidden = true;
	},
	showConnectPage: function() {
		startPage.hidden = true;
		connectedPage.hidden = false;
	},
	onError: function(reason) {
		alert("ERROR: " + reason); // real apps should use notification.alert
	},
	onSuccess: function(data){
    alert("data written: "+data[0]+", "+data[1]+", "+data[2]);
	}
};
