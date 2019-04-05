// var express = require("express");
// var bodyParser = require("body-parser");
// var routes = require("./routes/routes.js");
// var app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// routes(app);

// var server = app.listen(3000, function () {
//     console.log("app running on port.", server.address().port);
// });

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));



app.get('/', (request, response) =>  response.sendFile(`${__dirname}/asm.html`));

app.get('/asm', function(req, res){
  const asmCmd = req.query.cmd;
  var text = 'empty';
  var inst = '';
  var prehex = '';
  var hexbyte = '';
  var hex = '0x';
  if (asmCmd != '') {
    inst = asm2inst(asmCmd);
    prehex = inst.replace(/-/g, '');
    var i = 0;
    while (i < 30) {
      hexbyte = prehex.substr(i,4);
      hex = hex + parseInt(hexbyte, 2).toString(16);
      i = i + 4;
    }

    text = asmCmd + '_' + inst + '_' + hex;
    //console.log("12, 5: " + dec2bin(12,5));
    //console.log("12, 20: " + dec2bin(12,20));
    //console.log("-1, 5: " + dec2bin(-1,5));
    //console.log("-1, 20: " + dec2bin(-1,20));
  }
  res.status(200).send(text);
});

function asm2inst(asm){
  var inst = '';
  var op = asm.substr(0, asm.indexOf(' ')).toLowerCase();
  var args = asm.substr(asm.indexOf(' ') + 1).toLowerCase();
  args = args.replace(/ /g, '');
  var f3 = f30;
  var f7 = '0000000';
  var rd = '';
  var rs1 = '';
  var rs2 = '';
  var imm = '';
  var shamt = '';
  switch(op) {
    case 'lui':
      rd = dec2bin(parseInt(args.substr(1, asm.indexOf(','))),5);
      args = args.substr(args.indexOf(',') + 1);  // Remove rd from args
      imm = dec2bin(parseInt(args),20);
      inst = imm + '_' + rd + '_' + lui;
      break;
    case 'auipc':
      rd = dec2bin(parseInt(args.substr(1, asm.indexOf(','))),5);
      args = args.substr(args.indexOf(',') + 1);  // Remove rd from args
      imm = dec2bin(parseInt(args),20);
      inst = imm + '_' + rd + '_' + auipc;
      break;
    case 'jal':
      rd = dec2bin(parseInt(args.substr(1, asm.indexOf(','))),5);
      args = args.substr(args.indexOf(',') + 1);  // Remove rd from args
      imm = dec2bin(parseInt(args),21);
      inst = imm.substr(0,1) + imm.substr(10,20) + imm.substr(9,10) + imm.substr(1,9) + '_' + rd + '_' + jal;
      break;
    case 'jalr':
      f3 = f30;
      rd = dec2bin(parseInt(args.substr(1, asm.indexOf(','))),5);
      args = args.substr(args.indexOf(',') + 1);  // Remove rd from args
      imm = dec2bin(parseInt(args.substr(0, asm.indexOf('('))),12);
      args = args.substr(args.indexOf('(') + 1);  // Remove imm from args
      rs1 = dec2bin(parseInt(args.substr(1, asm.indexOf(')'))),5);
      inst = imm + '-' + rs1 + '-' + f3 + '-' + rd + '-' + jalr;
      break;
    case 'beq':
    case 'bne':
    case 'blt':
    case 'bge':
    case 'bltu':
    case 'bgeu':
      f3 = (op == 'beq' ? f30 :
            op == 'bne' ? f31 :
            op == 'blt' ? f34 :
            op == 'bge' ? f35 :
            op == 'bltu' ? f36 : f37);  // Default = Bgeu
      rs1 = dec2bin(parseInt(args.substr(1, asm.indexOf(','))),5);
      args = args.substr(args.indexOf(',') + 1);  // Remove rs1 from args
      rs2 = dec2bin(parseInt(args.substr(1, asm.indexOf(','))),5);
      args = args.substr(args.indexOf(',') + 1);  // Remove rs2 from args; only imm left
      imm = dec2bin(parseInt(args),13);
      inst = imm.substr(0,1) + imm.substr(2,6) + '-' + rs2 + '-' + rs1 + '-' + f3 + '-' + imm.substr(8,4) + imm.substr(1,1) + '-' +  branch;
      break;
    case 'lw':
      f3 = f32;
      rd = dec2bin(parseInt(args.substr(1, asm.indexOf(','))),5);
      args = args.substr(args.indexOf(',') + 1);  // Remove rd from args
      imm = dec2bin(parseInt(args.substr(0, asm.indexOf('('))),12);
      args = args.substr(args.indexOf('(') + 1);  // Remove imm from args
      rs1 = dec2bin(parseInt(args.substr(1, asm.indexOf(')'))),5);
      inst = imm + '-' + rs1 + '-' + f3 + '-' + rd + '-' + lw;
      break;
    case 'sw':
      f3 = f32;
      rs2 = dec2bin(parseInt(args.substr(1, asm.indexOf(','))),5);
      args = args.substr(args.indexOf(',') + 1);  // Remove rs2 from args
      imm = dec2bin(parseInt(args.substr(0, asm.indexOf('('))),12);
      args = args.substr(args.indexOf('(') + 1);  // Remove imm from args
      rs1 = dec2bin(parseInt(args.substr(1, asm.indexOf(')'))),5);
      inst = imm.substr(0,7) + '-' + rs2 + '-' + rs1 + '-' + f3 + '-' + imm.substr(7) + '-' + sw;
      break;
    case 'addi':
    case 'slti':
    case 'sltiu':
    case 'xori':
    case 'ori':
    case 'andi':
    case 'slli':
    case 'srli':
    case 'srai':
      f3 = (op == 'addi' ? f30 :
            op == 'slti' ? f32 :
            op == 'sltiu' ? f33 :
            op == 'xori' ? f34 :
            op == 'ori' ? f36 :
            op == 'andi' ? f37 :
            op == 'slli' ? f31 : f35);  // Default = Srli, Srai
      rd = dec2bin(parseInt(args.substr(1, asm.indexOf(','))),5);
      args = args.substr(args.indexOf(',') + 1);  // Remove rd from args
      rs1 = dec2bin(parseInt(args.substr(1, asm.indexOf(','))),5);
      args = args.substr(args.indexOf(',') + 1);  // Remove rs1 from args; only imm/shamt left
      if (op == 'slli' || op == 'srli' || op == 'srai') {
        shamt = dec2bin(parseInt(args),5);
        imm = (op == 'srai' ? '0100000' + shamt : '0000000' + shamt);
      } else {
        imm = dec2bin(parseInt(args),12);
      }
      inst = imm + '-' + rs1 + '-' + f3 + '-' + rd + '-' + itype;
      break;
    case 'add':
    case 'sub':
    case 'sll':
    case 'slt':
    case 'sltu':
    case 'xor':
    case 'srl':
    case 'sra':
    case 'or':
    case 'and':
      f3 = (op == 'add' ? f30 :
            op == 'sub' ? f30 :
            op == 'sll' ? f31 :
            op == 'slt' ? f32 :
            op == 'sltu' ? f33 :
            op == 'xor' ? f34 :
            op == 'srl' ? f35 :
            op == 'sra' ? f35 :
            op == 'or' ? f36 : f37);  // Default = And
      f7 = (op == 'sub' ? f71 :
            op == 'sra' ? f71 : f70);
      rd = dec2bin(parseInt(args.substr(1, asm.indexOf(','))),5);
      args = args.substr(args.indexOf(',') + 1);  // Remove rd from args
      rs1 = dec2bin(parseInt(args.substr(1, asm.indexOf(','))),5);
      args = args.substr(args.indexOf(',') + 1);  // Remove rs1 from args; only rs2 left
      rs2 = dec2bin(parseInt(args.substr(1)),5);
      inst = f7 + '-' + rs2 + '-' + rs1 + '-' + f3 + '-' + rd + '-' + rtype;
      break;
    default:
      inst = 'invalid';
  }
  return inst;
}

// Convert Int to 2's Complement 32-bit Binary, of bit-length 'size'
// From: https://stackoverflow.com/questions/9939760/how-do-i-convert-an-integer-to-binary-in-javascript
// And: https://stackoverflow.com/questions/5366849/convert-1-to-0001-in-javascript
function dec2bin(dec, size){
  var bin = (dec >>> 0).toString(2);
  var retVal = '';
  // If it's a negative number, it will be 32 bits in legth, so trim
  if (dec < 0) {
    retVal = bin.substr((32-parseInt(size)));
  }
  // Else, it will only be exactly as long as needed to represent the decimal in binary, so pad
  else {
    var pad = "000000000000000000000";
    retVal = pad.substring(21-parseInt(size)+bin.length) + bin;
  }
  return retVal;
}

// Constants for opcodes
const lui = '0110111';
const auipc = '0010111';
const jal = '1101111';
const jalr = '1100111';
const branch = '1100011';  // Beq, Bne, Blt, Bge, Bltu, Bgeu
const lw = '0000011';
const sw = '0100011';
const itype = '0010011';  // Addi, Slti, Sltiu, Xori, Ori, Andi, Slli, Srli, Srai
const rtype = '0110011';  // Add, Sub, Sll, Slt, Sltu, Xor, Srl, Sra, Or, And

// Constants for funct3
const f30 = '000';
const f31 = '001';
const f32 = '010';
const f33 = '011';
const f34 = '100';
const f35 = '101';
const f36 = '110';
const f37 = '111';

// Constants for funct7
const f70 = '0000000';
const f71 = '0100000';


app.listen(3001, () => console.info('Application running on port 3001'));
