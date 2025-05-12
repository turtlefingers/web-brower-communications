const SerialPort = require('serialport');

function setupSerialPort(addLog) {
    let serialPort;
    try {
        serialPort = new SerialPort.SerialPort({
            path: '/dev/tty.usbserial',
            baudRate: 9600
        });

        serialPort.on('data', (data) => {
            addLog('Serial', `Received: ${data.toString()}`);
        });

        serialPort.on('error', (error) => {
            addLog('Serial', `Error: ${error.message}`);
        });
    } catch (error) {
        addLog('Serial', `Failed to initialize serial port: ${error.message}`);
    }
    return serialPort;
}

module.exports = setupSerialPort; 