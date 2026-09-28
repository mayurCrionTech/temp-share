/**
 * DICV Paint Shop Digital Twin - Stage and Tag Configuration Registry
 * 
 * Complete mapping of all 23 stages with Unity Parameter IDs (MongoDB Tag ObjectIds),
 * Tag Names, and DICV Field Tag Names.
 */

const STAGES = [
  {
    index: 1,
    name: "LOADING",
    tags: {
      cabinType: {
        id: "69a00014028f2974fee4ab9f",
        tagName: "Loading_CabinType",
        dicvName: "RB_File[172].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "69a00014028f2974fee4aba0",
        tagName: "Loading_CabinNumber",
        dicvName: "RB_File[172].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b63",
        tagName: "Loading_CabinNumber_2",
        dicvName: "RB_File[172].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "69a00014028f2974fee4aba1",
        tagName: "Loading_SkidNumber",
        dicvName: "RB_File[172].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "69a00014028f2974fee4ab9e",
        tagName: "Loading_HangerNumber",
        dicvName: "Hanger_RFID_Data[1]"
      }
    }
  },
  {
    index: 2,
    name: "PRE DEGREASE",
    tags: {
      cabinType: {
        id: "69a00014028f2974fee4aba4",
        tagName: "PT_PreDeg_CabinType",
        dicvName: "RB_File[173].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "69a00014028f2974fee4aba5",
        tagName: "PT_PreDeg_CabinNumber",
        dicvName: "RB_File[173].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b66",
        tagName: "PT_PreDeg_CabinNumber_2",
        dicvName: "RB_File[173].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "69a00014028f2974fee4aba6",
        tagName: "PT_PreDeg_SkidNumber",
        dicvName: "RB_File[173].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "6a7af0a263f1464aeb071e3f",
        tagName: "PT_PreDeg_HangerNumber",
        dicvName: "Hanger_RFID_Data[2]"
      }
    }
  },
  {
    index: 3,
    name: "SEC 3  (Mist)",
    tags: {
      cabinType: {
        id: "6a7aea0f63f1464aeb04c02c",
        tagName: "PT_PreDeg_Mist_CabinType",
        dicvName: "RB_File[174].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "6a7aea0f63f1464aeb04c027",
        tagName: "PT_PreDeg_Mist_CabinNumber",
        dicvName: "RB_File[174].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b69",
        tagName: "PT_PreDeg_Mist_CabinNumber_2",
        dicvName: "RB_File[174].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "6a7aea0f63f1464aeb04c032",
        tagName: "PT_PreDeg_Mist_SkidNumber",
        dicvName: "RB_File[174].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "69a00014028f2974fee4aba3",
        tagName: "PT_PreDeg_Mist_HangerNumber",
        dicvName: "Hanger_RFID_Data[3]"
      }
    }
  },
  {
    index: 4,
    name: "DEGREASING DIP",
    tags: {
      cabinType: {
        id: "69a00014028f2974fee4abae",
        tagName: "PT_DipDeg_CabinType",
        dicvName: "RB_File[175].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "69a00014028f2974fee4abaf",
        tagName: "PT_DipDeg_CabinNumber",
        dicvName: "RB_File[175].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b6c",
        tagName: "PT_DipDeg_CabinNumber_2",
        dicvName: "RB_File[175].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "69a00014028f2974fee4abb0",
        tagName: "PT_DipDeg_SkidNumber",
        dicvName: "RB_File[175].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "69a00014028f2974fee4abad",
        tagName: "PT_DipDeg_HangerNumber",
        dicvName: "Hanger_RFID_Data[4]"
      }
    }
  },
  {
    index: 5,
    name: "SEC 5",
    tags: {
      cabinType: {
        id: "6a7aea0f63f1464aeb04c045",
        tagName: "Sec 5_CabinType",
        dicvName: "RB_File[176].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "6a7aea0f63f1464aeb04c040",
        tagName: "Sec 5_CabinNumber",
        dicvName: "RB_File[176].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b6f",
        tagName: "Sec 5_CabinNumber_2",
        dicvName: "RB_File[176].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "6a7aea0f63f1464aeb04c04b",
        tagName: "Sec 5_SkidNumber",
        dicvName: "RB_File[176].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "6a7af0a263f1464aeb071e46",
        tagName: "Sec 5_HangerNumber",
        dicvName: "Hanger_RFID_Data[5]"
      }
    }
  },
  {
    index: 6,
    name: "WATER RINSE 1&2",
    tags: {
      cabinType: {
        id: "69a00014028f2974fee4abb3",
        tagName: "PT_WR12_CabinType",
        dicvName: "RB_File[177].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "69a00014028f2974fee4abb4",
        tagName: "PT_WR12_CabinNumber",
        dicvName: "RB_File[177].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b72",
        tagName: "PT_WR12_CabinNumber_2",
        dicvName: "RB_File[177].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "69a00014028f2974fee4abb5",
        tagName: "PT_WR12_SkidNumber",
        dicvName: "RB_File[177].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "69a00014028f2974fee4abb2",
        tagName: "PT_WR12_HangerNumber",
        dicvName: "Hanger_RFID_Data[6]"
      }
    }
  },
  {
    index: 7,
    name: "ACTIVATION",
    tags: {
      cabinType: {
        id: "69a00014028f2974fee4abb8",
        tagName: "PT_Activation_CabinType",
        dicvName: "RB_File[178].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "69a00014028f2974fee4abb9",
        tagName: "PT_Activation_CabinNumber",
        dicvName: "RB_File[178].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b75",
        tagName: "PT_Activation_CabinNumber_2",
        dicvName: "RB_File[178].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "69a00014028f2974fee4abba",
        tagName: "PT_Activation_SkidNumber",
        dicvName: "RB_File[178].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "69a00014028f2974fee4abb7",
        tagName: "PT_Activation_HangerNumber",
        dicvName: "Hanger_RFID_Data[7]"
      }
    }
  },
  {
    index: 8,
    name: "PHOSPATING",
    tags: {
      cabinType: {
        id: "69a00014028f2974fee4abbd",
        tagName: "PT_Phospating_CabinType",
        dicvName: "RB_File[179].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "69a00014028f2974fee4abbe",
        tagName: "PT_Phospating_CabinNumber",
        dicvName: "RB_File[179].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b78",
        tagName: "PT_Phospating_CabinNumber_2",
        dicvName: "RB_File[179].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "69a00014028f2974fee4abbf",
        tagName: "PT_Phospating_SkidNumber",
        dicvName: "RB_File[179].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "69a00014028f2974fee4abbc",
        tagName: "PT_Phospating_HangerNumber",
        dicvName: "Hanger_RFID_Data[8]"
      }
    }
  },
  {
    index: 9,
    name: "SEC 9",
    tags: {
      cabinType: {
        id: "6a7aea0f63f1464aeb04c074",
        tagName: "Sec 9_CabinType",
        dicvName: "RB_File[180].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "6a7aea0f63f1464aeb04c06f",
        tagName: "Sec 9_CabinNumber",
        dicvName: "RB_File[180].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b7b",
        tagName: "Sec 9_CabinNumber_2",
        dicvName: "RB_File[180].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "6a7aea0f63f1464aeb04c07a",
        tagName: "Sec 9_SkidNumber",
        dicvName: "RB_File[180].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "6a7af0a263f1464aeb071e4f",
        tagName: "Sec 9_HangerNumber",
        dicvName: "Hanger_RFID_Data[9]"
      }
    }
  },
  {
    index: 10,
    name: "WATER RINSE 3&4",
    tags: {
      cabinType: {
        id: "69a00015028f2974fee4abc2",
        tagName: "PT_WR34_CabinType",
        dicvName: "RB_File[181].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "69a00015028f2974fee4abc3",
        tagName: "PT_WR34_CabinNumber",
        dicvName: "RB_File[181].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b7e",
        tagName: "PT_WR34_CabinNumber_2",
        dicvName: "RB_File[181].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "69a00015028f2974fee4abc4",
        tagName: "PT_WR34_SkidNumber",
        dicvName: "RB_File[181].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "69a00015028f2974fee4abc1",
        tagName: "PT_WR34_HangerNumber",
        dicvName: "Hanger_RFID_Data[10]"
      }
    }
  },
  {
    index: 11,
    name: "WATER RINSE 5",
    tags: {
      cabinType: {
        id: "69a00015028f2974fee4abc7",
        tagName: "PT_WR5_CabinType",
        dicvName: "RB_File[182].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "69a00015028f2974fee4abc8",
        tagName: "PT_WR5_CabinNumber",
        dicvName: "RB_File[182].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b81",
        tagName: "PT_WR5_CabinNumber_2",
        dicvName: "RB_File[182].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "69a00015028f2974fee4abc9",
        tagName: "PT_WR5_SkidNumber",
        dicvName: "RB_File[182].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "69a00015028f2974fee4abc6",
        tagName: "PT_WR5_HangerNumber",
        dicvName: "Hanger_RFID_Data[11]"
      }
    }
  },
  {
    index: 12,
    name: "DA WATER SPRAY",
    tags: {
      cabinType: {
        id: "69a00015028f2974fee4abcc",
        tagName: "PT_DI_CabinType",
        dicvName: "RB_File[183].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "69a00015028f2974fee4abcd",
        tagName: "PT_DI_CabinNumber",
        dicvName: "RB_File[183].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b84",
        tagName: "PT_DI_CabinNumber_2",
        dicvName: "RB_File[183].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "69a00015028f2974fee4abce",
        tagName: "PT_DI_SkidNumber",
        dicvName: "RB_File[183].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "69a00015028f2974fee4abcb",
        tagName: "PT_DI_HangerNumber",
        dicvName: "Hanger_RFID_Data[12]"
      }
    }
  },
  {
    index: 13,
    name: "SEC 12 A",
    tags: {
      cabinType: {
        id: "6a7aea1063f1464aeb04c0a3",
        tagName: "Sec 12A_CabinType",
        dicvName: "RB_File[184].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "6a7aea1063f1464aeb04c09e",
        tagName: "Sec 12A_CabinNumber",
        dicvName: "RB_File[184].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b87",
        tagName: "Sec 12A_CabinNumber_2",
        dicvName: "RB_File[184].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "6a7aea1063f1464aeb04c0a9",
        tagName: "Sec 12A_SkidNumber",
        dicvName: "RB_File[184].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "6a7af0e163f1464aeb0739a8",
        tagName: "Sec 12A_HangerNumber",
        dicvName: "Hanger_RFID_Data[13]"
      }
    }
  },
  {
    index: 14,
    name: "SEC 13",
    tags: {
      cabinType: {
        id: "6a7aea1063f1464aeb04c0b1",
        tagName: "Sec 13_CabinType (PT WET INSPECT)",
        dicvName: "RB_File[185].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "6a7aea1063f1464aeb04c0ac",
        tagName: "Sec 13_CabinNumber (PT WET INSPECT)",
        dicvName: "RB_File[185].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b8a",
        tagName: "Sec 13_CabinNumber_2",
        dicvName: "RB_File[185].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "6a7aea1063f1464aeb04c0b7",
        tagName: "Sec 13_SkidNumber (PT WET INSPECT)",
        dicvName: "RB_File[185].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "6a7af0e163f1464aeb0739ab",
        tagName: "Sec 13_HangerNumber (PT WET INSPECT)",
        dicvName: "Hanger_RFID_Data[14]"
      }
    }
  },
  {
    index: 15,
    name: "SEC 14",
    tags: {
      cabinType: {
        id: "6a7aea1063f1464aeb04c0bf",
        tagName: "Sec 14_CabinType",
        dicvName: "RB_File[186].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "6a7aea1063f1464aeb04c0ba",
        tagName: "Sec 14_CabinNumber",
        dicvName: "RB_File[186].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b8d",
        tagName: "Sec 14_CabinNumber_2",
        dicvName: "RB_File[186].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "6a7aea1063f1464aeb04c0c5",
        tagName: "Sec 14_SkidNumber",
        dicvName: "RB_File[186].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "6a7af0e163f1464aeb0739ae",
        tagName: "Sec 14_HangerNumber",
        dicvName: "Hanger_RFID_Data[15]"
      }
    }
  },
  {
    index: 16,
    name: "E COAT",
    tags: {
      cabinType: {
        id: "69a00015028f2974fee4abd1",
        tagName: "ED_ECoat_CabinType",
        dicvName: "RB_File[187].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "69a00015028f2974fee4abd2",
        tagName: "ED_ECoat_CabinNumber",
        dicvName: "RB_File[187].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b90",
        tagName: "ED_ECoat_CabinNumber_2",
        dicvName: "RB_File[187].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "69a00015028f2974fee4abd3",
        tagName: "ED_ECoat_SkidNumber",
        dicvName: "RB_File[187].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "69a00015028f2974fee4abd0",
        tagName: "ED_ECoat_HangerNumber",
        dicvName: "Hanger_RFID_Data[16]"
      }
    }
  },
  {
    index: 17,
    name: "SEC 16",
    tags: {
      cabinType: {
        id: "6a7aea1063f1464aeb04c0d8",
        tagName: "Sec 16_CabinType",
        dicvName: "RB_File[188].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "6a7aea1063f1464aeb04c0d3",
        tagName: "Sec 16_CabinNumber",
        dicvName: "RB_File[188].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b93",
        tagName: "Sec 16_CabinNumber_2",
        dicvName: "RB_File[188].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "6a7aea1063f1464aeb04c0de",
        tagName: "Sec 16_SkidNumber",
        dicvName: "RB_File[188].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "6a7af0e163f1464aeb0739b3",
        tagName: "Sec 16_HangerNumber",
        dicvName: "Hanger_RFID_Data[17]"
      }
    }
  },
  {
    index: 18,
    name: "UF RINSE-1 (SPRAY)",
    tags: {
      cabinType: {
        id: "69a00015028f2974fee4abd6",
        tagName: "ED_UFWR1_CabinType",
        dicvName: "RB_File[189].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "69a00015028f2974fee4abd7",
        tagName: "ED_UFWR1_CabinNumber",
        dicvName: "RB_File[189].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b96",
        tagName: "ED_UFWR1_CabinNumber_2",
        dicvName: "RB_File[189].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "69a00015028f2974fee4abd8",
        tagName: "ED_UFWR1_SkidNumber",
        dicvName: "RB_File[189].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "69a00015028f2974fee4abd5",
        tagName: "ED_UFWR1_HangerNumber",
        dicvName: "Hanger_RFID_Data[18]"
      }
    }
  },
  {
    index: 19,
    name: "UF RINSE-2 (DIP)",
    tags: {
      cabinType: {
        id: "69a00015028f2974fee4abdb",
        tagName: "ED_UFWR2_CabinType",
        dicvName: "RB_File[190].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "69a00015028f2974fee4abdc",
        tagName: "ED_UFWR2_CabinNumber",
        dicvName: "RB_File[190].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b99",
        tagName: "ED_UFWR2_CabinNumber_2",
        dicvName: "RB_File[190].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "69a00015028f2974fee4abdd",
        tagName: "ED_UFWR2_SkidNumber",
        dicvName: "RB_File[190].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "69a00015028f2974fee4abda",
        tagName: "ED_UFWR2_HangerNumber",
        dicvName: "Hanger_RFID_Data[19]"
      }
    }
  },
  {
    index: 20,
    name: "SEC 19",
    tags: {
      cabinType: {
        id: "6a7aea1063f1464aeb04c0fc",
        tagName: "Sec 19_CabinType",
        dicvName: "RB_File[191].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "6a7aea1063f1464aeb04c0f7",
        tagName: "Sec 19_CabinNumber",
        dicvName: "RB_File[191].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b9c",
        tagName: "Sec 19_CabinNumber_2",
        dicvName: "RB_File[191].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "6a7aea1063f1464aeb04c102",
        tagName: "Sec 19_SkidNumber",
        dicvName: "RB_File[191].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "6a7af0e163f1464aeb0739ba",
        tagName: "Sec 19_HangerNumber",
        dicvName: "Hanger_RFID_Data[20]"
      }
    }
  },
  {
    index: 21,
    name: "RCDI WATER SPRAY",
    tags: {
      cabinType: {
        id: "69a00015028f2974fee4abe0",
        tagName: "ED_RCDI_CabinType",
        dicvName: "RB_File[192].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "69a00015028f2974fee4abe1",
        tagName: "ED_RCDI_CabinNumber",
        dicvName: "RB_File[192].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457b9f",
        tagName: "ED_RCDI_CabinNumber_2",
        dicvName: "RB_File[192].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "69a00015028f2974fee4abe2",
        tagName: "ED_RCDI_SkidNumber",
        dicvName: "RB_File[192].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "69a00015028f2974fee4abdf",
        tagName: "ED_RCDI_HangerNumber",
        dicvName: "Hanger_RFID_Data[21]"
      }
    }
  },
  {
    index: 22,
    name: "SEC 21",
    tags: {
      cabinType: {
        id: "6a7aea1063f1464aeb04c115",
        tagName: "Sec 21_CabinType",
        dicvName: "RB_File[193].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "6a7aea1063f1464aeb04c110",
        tagName: "Sec 21_CabinNumber",
        dicvName: "RB_File[193].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457ba2",
        tagName: "Sec 21_CabinNumber_2",
        dicvName: "RB_File[193].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "6a7aea1063f1464aeb04c11b",
        tagName: "Sec 21_SkidNumber",
        dicvName: "RB_File[193].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "6a7af0e163f1464aeb0739bf",
        tagName: "Sec 21_HangerNumber",
        dicvName: "Hanger_RFID_Data[22]"
      }
    }
  },
  {
    index: 23,
    name: "SEC 22",
    tags: {
      cabinType: {
        id: "6a7aea1063f1464aeb04c123",
        tagName: "Sec 22_CabinType",
        dicvName: "RB_File[194].Cab_Body_Code"
      },
      cabinNumber1: {
        id: "6a7aea1063f1464aeb04c11e",
        tagName: "Sec 22_CabinNumber",
        dicvName: "RB_File[194].Serial_No_VIN_1"
      },
      cabinNumber2: {
        id: "6a7474663d755cea2b457ba5",
        tagName: "Sec 22_CabinNumber_2",
        dicvName: "RB_File[194].Serial_No_VIN_2"
      },
      skidNumber: {
        id: "6a7aea1063f1464aeb04c129",
        tagName: "Sec 22_SkidNumber",
        dicvName: "RB_File[194].Dip_Paint_skid"
      },
      hangerNumber: {
        id: "6a7af0e163f1464aeb0739c2",
        tagName: "Sec 22_HangerNumber",
        dicvName: "Hanger_RFID_Data[23]"
      }
    }
  }
];

// Helper maps & sets for high performance queries
const ALL_TAG_IDS = [];
const TAG_MAP_BY_ID = {};
const SKID_TAG_IDS = [];
const VIN1_TAG_IDS = [];
const VIN2_TAG_IDS = [];
const CABIN_TYPE_TAG_IDS = [];
const HANGER_TAG_IDS = [];

STAGES.forEach(stage => {
  Object.keys(stage.tags).forEach(role => {
    const tag = stage.tags[role];
    if (tag && tag.id) {
      ALL_TAG_IDS.push(tag.id);
      TAG_MAP_BY_ID[tag.id] = {
        stageIndex: stage.index,
        stageName: stage.name,
        role: role,
        tagName: tag.tagName,
        dicvName: tag.dicvName
      };

      if (role === 'skidNumber') SKID_TAG_IDS.push(tag.id);
      if (role === 'cabinNumber1') VIN1_TAG_IDS.push(tag.id);
      if (role === 'cabinNumber2') VIN2_TAG_IDS.push(tag.id);
      if (role === 'cabinType') CABIN_TYPE_TAG_IDS.push(tag.id);
      if (role === 'hangerNumber') HANGER_TAG_IDS.push(tag.id);
    }
  });
});

module.exports = {
  STAGES,
  ALL_TAG_IDS,
  TAG_MAP_BY_ID,
  SKID_TAG_IDS,
  VIN1_TAG_IDS,
  VIN2_TAG_IDS,
  CABIN_TYPE_TAG_IDS,
  HANGER_TAG_IDS
};
