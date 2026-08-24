const assetSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      description: "Id of the Asset",
      example: "67c04ff93865881b9c8a452a"
    },
    status: {
      type: "string",
      description: "The current status of the assest",
      enum: [
        "Active",
        "Standby",
        "Breakdown",
        "Under Maintenance",
        "Decommissioned"
      ],
      example: "Active"
    },
    images: {
      type: "array",
      items: {
        type: "string",
        description: "List of the image file IDs associated with the asset",
        example: ""
      }
    },
    qrCode: {
      type: "string",
      description: "QR code file ID associated with the asset",
      example: "67c04ff93865881b9c8a452b"
    },
    generalDetails: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the asset",
          example: "Asset 213"
        },
        number: {
          type: "string",
          description : "Unique asset number",
          example: "asset231"
        },
        description: {
          type: "string",
          description: "A detailed description of the asset",
          example: "Asset1"
        },
        runningMode: {
          type: "string",
          description: "The running mode of the asset",
          enum: [
            "Rotating",
            "Static",
          ],
          example: "Rotating"
        },
        bussinessUnit: {
          type: "string",
          description: "Reference ID of the associated business unit",
          example: "6641959acbe6ea3941e60789"
        },
        category: {
          type: "string",
          description: "Reference ID of the asset category",
          example: "66f1cad3eec09fbcae25c8b4"
        },
        department: {
          type: "string",
          description: "Reference ID of the department",
          example: "66a9da8cd82efb35acf711fe"
        },
        criticalityLevel: {
          type: "string",
          description: "The criticality level of the asset",
          enum: [
            "emergency",
            "critical",
            "normal"
          ],
          example: "Emergency"         
        },
        functionalArea: {
          type: "string",
          description: "The functional area of the asset",
          enum: [
            "Utilities",
            "Production - Refinery",
            "Packing",
            "Quality",
            "Lab",
            "Mechanical",   
            "Electrical", 
            "Tank Farm",
          ],
          example: "Production - Refinery"
        },
        owner: {
          type: "string",
          description: "User ID of the asset owner",
          example: "66a9e2ee473e2c8b397bf26b"
        }
      },
      required: ["name", "number", "department", "owner"]
    },
    specifications: {
      type: "object",
      properties: {
        manufacturingDetails: {
          type: "object",
          properties: {
            type: {
              type: "string",
              description: "The type of the asset",
              enum: [
                "Standard Asset",
                "Fabricated Asset"
              ],
              example: "Standard Asset"
            },
            make: {
              type: "string",
              description: "Make of the asset",
              example: "Crion"
            },
            model: {
              type: "string",
              description: "Model of the asset",
              example: "Clonos"
            },
            serialNumber:{
              type: "string",
              description: "Serial number of the asset",
              example: "264315222"
            },
            manufacturer: {
              type: "string",
              description: "Manufacturer of the asset",
              example: "Crion"
            },
            installationDate: {
              type: "string",
              format: "date-time",
              description: "Installation date of the asset",
              example: "2023-01-01T00:00:00.000+00:00"
            },
            serviceLiquid: {
              type: "string",
              description: "Service liquid used in the asset",
              example: "test"
            }
          }
        },
        hazardousAreaDetails: {
          type: "object",
          properties: {
            zoneClassification: {
              type: "string",
              description: "Zone classification of the hazardous area",
              example: "ZON"
            },
            gasGroup: {
              type: "string",
              description: "Gas group of the hazardous area",
              example: "G2"
            },
            tempratureClassification: {
              type: "string",
              description: "Temperature classification of the hazardous area",
              example: "T1"
            }
          }
        },
        warrantyDetails: {
          type: "object",
          properties: {
            isWarrantyIncluded: {
              type: "boolean",
              description: "Indicates if warranty is included",
              example: "false"
            },
            supplierName: {
              type: "string",
              description: "Supplier name of the asset",
              example: "Admin"
            },
            supplierEmail: {
              type: "string",
              description: "Supplier email for warranty contact",
              example: "admin@ciontech.com"
            },
            warrantyPeriod: {
              type: "object",
              properties: {
                value: {
                  type: "string",
                  description: "Warranty duration value",
                  example: "88"
                },
                type: {
                  type: "string",
                  description: "Warranty duration type",
                  enum: [
                    "months",
                    "years"
                  ],
                  example: "months"
                }
              }
            },
            warrantyEndDate: {
              type: "string",
              format: "date-time",
              description: "End date of the warranty",
              example: "2024-01-01T00:00:00.000+00:00"
            },
            termsAndConditions: {
              type: "string",
              description: "Reference to terms and conditions file",
              example: "67b5ea6ed37551937195ec1f"
            }
          }
        },
        calibrationDetails: {
          type: "object",
          properties: {
            lastCalibrationDate: {
              type: "string",
              format: "date-time",
              description: "Date of last calibration",
              example: ""
            },
            calibrationCycle: {
              type: "object",
              properties: {
                value: {
                  type: "string",
                  description: "Calibration cycle value",
                  example: "1"
                },
                type: {
                  type: "string",
                  description: "Calibration cycle type",
                  enum: [
                    "months",
                    "years"
                  ],
                  example: "months"
                }
              }
            },
            corrosionCheckDate: {
              type: "string",
              format: "date-time",
              description: "Date of last corrosion check",
              example: "2025-02-11T23:51:00.000+00:00"
            },
            corrosionCycle: {
              type: "object",
              properties: {
                value: {
                  type: "string",
                  description: "Corrosion cycle value",
                  example: "2"
                },
                type: {
                  type: "string",
                  description: "Corrosion cycle type",
                  enum: [
                    "months",
                    "years"
                  ],
                  example: "months"
                }
              }
            },
            designThickness: {
              type: "object",
              properties: {
                value: {
                  type: "string",
                  description: "Design thickness value",
                  example: "3"
                },
                type: {
                  type: "string",
                  description: "Design thickness unit",
                  enum: [
                    "mm",
                    "inches"
                  ],
                  example: "mm"
                }
              }
            },
            allowableThickness: {
              type: "object",
              properties: {
                value: {
                  type: "number",
                  description: "Allowable thickness value",
                  example: "44"
                },
                type: {
                  type: "string",
                  description: "Allowable thickness unit",
                  enum: [
                    "mm",
                    "inches"
                  ],
                  example: "mm"
                }
              }
            },
            meanTimeToRepair: {
              type: "number",
              description: "Mean time to repair the asset",
              example: "2"
            },
            meanTimeBetweenFailures: {
              type: "number",
              description: "Mean time between failures of the asset",
              example: "5"
            },
            lastAuditDate: {
              type: "string",
              format: "date-time",
              description: "Date of last audit",
              example: "2025-02-11T23:51:00.000+00:00"
            }
          }
        }
      }
    },
    locationAndHierarchyDetails: {
      type: "object",
      properties: {
        geographicalCoordinates: {
          type: "object",
          properties: {
            latitude: {
              type: "number",
              description: "Latitude coordinate of the asset",
              example: "3456"
            },
            longitude: {
              type: "number",
              description: "Longitude coordinate of the asset",
              example: "8765"
            },
            elevation: {
              type: "number",
              description: "Elevation of the asset",
              example: "34"
            }
          }
        },
        hierarchy: {
          type: "object",
          properties: {
            parent: {
              type: "string",
              description: "Reference ID of the parent asset",
              example: "66ba05960d19d3e138726cfd"
            },
            ancestor: {
              type: "string",
              description: "Reference ID of the ancestor asset",
              example: ""
            }
          }
        }
      }
    },
    isregistrationCompleted: {
      type: "boolean",
      description: "Indicates if asset registration is completed",
      example: "false"
    },
    updatedBy: {
      type: "string",
      description: "User ID of the last person who updated the asset",
      example: "66b9e97fdf9c132bee9c2b81"
    },
    createdBy: {
      type: "string",
      description: "User ID of the asset creator",
      example: "66b9e97fdf9c132bee9c2b81"
    },
    isDeleted: {
      type: "boolean",
      description: "Indicates if the asset is deleted",
      example: "false"
    },
    isMaintenancePresent: {
      type: "boolean",
      description: "Indicates if maintenance records exist for the asset",
      example: "false"
    },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "Date and time when asset is created",
      example: "2024-08-13T08:25:22.311+00:00"
    },
    updatedAt: {
      type: "string",
      format: "date-time",
      description: "Date and time when asset is last updated",
      example: "2025-04-07T06:19:46.050+00:00"
    }
  },
  required: ["isDeleted", "updatedBy", "createdBy"]
}

    
module.exports = { assetSchema }
