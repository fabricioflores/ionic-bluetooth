import { Component, NgZone } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { ToastController } from '@ionic/angular';

interface Device {
  "class": number,
  "id": string,
  "address": string,
  "name": string
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {

  pairedList: Device[];
  listToggle: boolean = false;
  pairedDeviceID: number = null;
  connectedDevice: boolean = false;
  response = {};

  constructor(private bluetoothSerial: BluetoothSerial, private toastController: ToastController, private zone: NgZone) {
    this.checkBluetoothEnabled();
  }

  checkBluetoothEnabled() {
    this.bluetoothSerial.isEnabled().then(() => {
      this.listPairedDevices();
    }, () => {
      this.onError('Por favor habilite el Bluetooth');
    });
  }

  listPairedDevices() {
    this.bluetoothSerial.list().then(success => {
      this.pairedList = success;
      this.listToggle = true;
    }, () => {
      this.onError('Por favor habilite el Bluetooth');
      this.listToggle = false;
    });
  }

  selectDevice() {
    let connectedDevice = this.pairedList[this.pairedDeviceID];
    if (!connectedDevice || !connectedDevice.address) {
      this.onError('Seleccione un dispositivo pareado para conectar');
      return;
    }
    let address = connectedDevice.address;
    this.connect(address);
  }

  connect(address) {
    this.bluetoothSerial.connect(address).subscribe(() => {
      this.deviceConnected();
      this.response = {};
      this.connectedDevice = true;
      this.onSuccess('Dispositivo conectado');
    }, () => {
      this.onError('Seleccione un dispositivo pareado para conectar');
    });
  }

  deviceConnected() {
    this.bluetoothSerial.subscribe('\r\n').subscribe(success => {
      this.zone.run(() => {
        this.response[success] = this.response[success] === undefined ? 0 : this.response[success] + 1;
      });
    }, (error) => {
      this.onError(error);
    });
  }

  disconnect() {
    this.bluetoothSerial.disconnect();
    this.connectedDevice = false;
    this.onSuccess('Dispositivo desconectado');
  }

  onSuccess(message: string) {
    this.toastController.create({
      message,
      duration: 2000,
      color: 'success'
    }).then(toast => {
      toast.present();
    })
  }

  onError(message: string) {
    this.toastController.create({
      message,
      duration: 2000,
      color: 'danger'
    }).then(toast => {
      toast.present();
    })
  }

}
