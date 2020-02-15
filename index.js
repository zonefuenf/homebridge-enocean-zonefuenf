// Generated by CoffeeScript 2.5.1
(function() {
    // Copyright (c) 2019 Alexander Sporn. All rights reserved.

  var Accessory, Characteristic, Enocean, EnoceanPlatform, Service, UUIDGen;

  Enocean = require('./Enocean');

  Accessory = void 0;

  Service = void 0;

  Characteristic = void 0;

  UUIDGen = void 0;

  module.exports = function(homebridge) {
    Accessory = homebridge.platformAccessory;
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;
    homebridge.registerPlatform('homebridge-enocean-zonefuenf', 'enocean-zonefuenf', EnoceanPlatform, true);
  };

  EnoceanPlatform = function(log, config1, api) {
    this.log = log;
    this.config = config1;
    this.api = api;
    if (this.config == null) {
      this.log("No configuration found!");
      return;
    }
    if (this.config.port == null) {
      this.log("Property port in configuration has to be set!");
      return;
    }
    this.accessories = {};
    this.enocean = new Enocean({
      port: this.config.port
    });
    this.enocean.on('pressed', (sender, button) => {
      return this.setSwitchEventValue(sender, button, Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
    });
    this.api.on('didFinishLaunching', () => {
      var accessory, i, len, ref;
      ref = this.config.accessories;
      for (i = 0, len = ref.length; i < len; i++) {
        accessory = ref[i];
        this.addAccessory(accessory);
      }
    });
  };

  EnoceanPlatform.prototype.setSwitchEventValue = function(sender, button, value) {
    var accessory, characteristic, i, len, ref, service;
    accessory = this.accessories[sender];
    if (accessory == null) {
      this.log('Unknown sender', sender);
    }
    ref = accessory.services;
    for (i = 0, len = ref.length; i < len; i++) {
      service = ref[i];
      if (service.UUID === Service.StatelessProgrammableSwitch.UUID && service.subtype === button) {
        characteristic = service.getCharacteristic(Characteristic.ProgrammableSwitchEvent);
        characteristic.setValue(value);
        this.log(accessory.displayName + ':', 'Button', button, 'pressed');
        return;
      }
    }
    this.log('Could not find button', button);
  };

  EnoceanPlatform.prototype.configureAccessory = function(accessory) {
    var serial;
    this.log('Configure accessory:', accessory.displayName);
    accessory.reachable = true;
    accessory.on('identify', (paired, callback) => {
      this.log(accessory.displayName, 'identified');
      callback();
    });
    serial = accessory.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.SerialNumber).value;
    if (serial == null) {
      this.api.unregisterPlatformAccessories('homebridge-enocean-zonefuenf', 'enocean-zonefuenf', [accessory]);
      return;
    }
    this.accessories[serial] = accessory;
    this.setSwitchEventValue(serial, 'A0', -1);
    this.setSwitchEventValue(serial, 'AI', -1);
    this.setSwitchEventValue(serial, 'B0', -1);
    this.setSwitchEventValue(serial, 'BI', -1);
  };

  EnoceanPlatform.prototype.createProgrammableSwitch = function(name, model, serial) {
    var accessory, buttonA0, buttonAI, buttonB0, buttonBI, info, label, uuid;
    uuid = UUIDGen.generate(serial);
    accessory = new Accessory(name, uuid);
    accessory.on('identify', (paired, callback) => {
      this.log(accessory.displayName, 'identfied');
      callback();
    });
    info = accessory.getService(Service.AccessoryInformation);
    info.updateCharacteristic(Characteristic.Manufacturer, "EnOcean").updateCharacteristic(Characteristic.Model, model).updateCharacteristic(Characteristic.SerialNumber, serial).updateCharacteristic(Characteristic.FirmwareRevision, '1.0');
    label = new Service.ServiceLabel(accessory.displayName);
    label.getCharacteristic(Characteristic.ServiceLabelNamespace).updateValue(Characteristic.ServiceLabelNamespace.ARABIC_NUMERALS);
    accessory.addService(label);
    buttonAI = this.createProgrammableSwitchButton(accessory.displayName, 1, 'AI');
    buttonA0 = this.createProgrammableSwitchButton(accessory.displayName, 2, 'A0');
    buttonBI = this.createProgrammableSwitchButton(accessory.displayName, 3, 'BI');
    buttonB0 = this.createProgrammableSwitchButton(accessory.displayName, 4, 'B0');
    accessory.addService(buttonAI);
    accessory.addService(buttonA0);
    accessory.addService(buttonBI);
    accessory.addService(buttonB0);
    return accessory;
  };

  EnoceanPlatform.prototype.createProgrammableSwitchButton = function(accesoryName, buttonIndex, button) {
    var singleButton;
    button = new Service.StatelessProgrammableSwitch(accesoryName + ' ' + button, button);
    singleButton = {
      minValue: Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS,
      maxValue: Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS
    };
    button.getCharacteristic(Characteristic.ProgrammableSwitchEvent).setProps(singleButton);
    button.getCharacteristic(Characteristic.ServiceLabelIndex).setValue(buttonIndex);
    return button;
  };

  EnoceanPlatform.prototype.addAccessory = function(config) {
    var accessory;
    if (this.accessories[config.id] != null) {
      this.log('Skip accessory without EnOcean id: ' + config.name);
      return;
    }
    this.log('Add accessory:', config.name);
    accessory = this.createProgrammableSwitch(config.name, config.eep, config.id);
    this.accessories[config.id] = accessory;
    this.api.registerPlatformAccessories('homebridge-enocean-zonefuenf', 'enocean-zonefuenf', [accessory]);
  };

}).call(this);
