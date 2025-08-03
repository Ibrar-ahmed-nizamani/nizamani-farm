"use server";

import clientPromise from "@/lib/mongodb"; // Assuming this is your connection helper
import {
  DateFilterOptions,
  FieldListItem,
  FieldPageData,
} from "../types/FieldTypes";
import { ObjectId } from "mongodb";
import { DateRangeSelectorProps } from "../types/types";

// This is the ONLY function your page will need to call.
export async function getFieldsForListPage(): Promise<FieldListItem[]> {
  try {
    const client = await clientPromise;
    // IMPORTANT: Use the new collection names
    const db = client.db("farm");
    const fieldsCollection = db.collection("new_fields");

    // The single, powerful aggregation pipeline
    const pipeline = [
      // Stage 1: Start with all fields
      {
        $project: {
          _id: 1,
          name: 1,
          totalArea: 1,
          // Calculate farmerCount directly from the size of the allocations array
          farmerCount: { $size: "$allocations" },
          // Calculate remainingArea by subtracting the sum of allocated areas
          remainingArea: {
            $subtract: ["$totalArea", { $sum: "$allocations.allocatedArea" }],
          },
        },
      },
      // Stage 2: Use $lookup to join with aggregated transaction data
      {
        $lookup: {
          from: "new_transactions",
          localField: "_id",
          foreignField: "fieldId",
          // This is a sub-pipeline that calculates totals for each field
          pipeline: [
            {
              $group: {
                _id: "$fieldId",
                totalIncome: {
                  $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
                },
                totalExpenses: {
                  $sum: {
                    $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
                  },
                },
              },
            },
          ],
          as: "financials",
        },
      },
      // Stage 3: Deconstruct the 'financials' array and merge the fields
      {
        $unwind: {
          path: "$financials",
          preserveNullAndEmptyArrays: true, // Keep fields even if they have no transactions
        },
      },
      // Stage 4: Final projection to shape the data for the UI
      {
        $project: {
          _id: { $toString: "$_id" }, // Convert ObjectId to string for the client
          name: 1,
          totalArea: 1,
          farmerCount: 1,
          remainingArea: { $ifNull: ["$remainingArea", "$totalArea"] },
          totalIncome: { $ifNull: ["$financials.totalIncome", 0] },
          totalExpense: { $ifNull: ["$financials.totalExpenses", 0] },
          balance: {
            $subtract: [
              { $ifNull: ["$financials.totalIncome", 0] },
              { $ifNull: ["$financials.totalExpenses", 0] },
            ],
          },
        },
      },
      // Stage 5: Sort the final results
      {
        $sort: { name: 1 },
      },
    ];

    const fieldsWithSummary = await fieldsCollection
      .aggregate(pipeline)
      .toArray();

    // The result is already perfectly typed and shaped
    return fieldsWithSummary as FieldListItem[];
  } catch (error) {
    console.error("Failed to fetch fields with summary:", error);
    return [];
  }
}

// This is the ONLY function your page will need to call.
export async function getFieldDetailPageData(
  fieldId: string,
  filterOptions: DateFilterOptions = {}
): Promise<FieldPageData | null> {
  try {
    const client = await clientPromise;
    const db = client.db("farm");
    const fieldsCollection = db.collection("new_fields");

    const fieldObjectId = new ObjectId(fieldId);

    // Date filter logic remains the same...
    const dateFilter: { createdAt?: { $gte?: Date; $lt?: Date } } = {};
    const { year, month, startDate, endDate } = filterOptions;
    if (startDate && endDate) {
      // Your existing date logic is fine
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.createdAt = { $gte: start, $lt: end };
    } else if (year && year !== "all") {
      // Your existing year/month logic is fine
      const yearNum = parseInt(year);
      if (month && month !== "all") {
        const monthNum = parseInt(month) - 1;
        dateFilter.createdAt = {
          $gte: new Date(yearNum, monthNum, 1),
          $lt: new Date(yearNum, monthNum + 1, 1),
        };
      } else {
        dateFilter.createdAt = {
          $gte: new Date(yearNum, 0, 1),
          $lt: new Date(yearNum + 1, 0, 1),
        };
      }
    }

    const pipeline = [
      // Stage 1: Find the specific field
      { $match: { _id: fieldObjectId } },

      // Stage 2: NEW - Pre-calculate all farmer totals for this field
      {
        $lookup: {
          from: "new_transactions",
          let: { field_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$fieldId", "$$field_id"] },
                ...dateFilter, // Apply date filter here
              },
            },
            {
              $group: {
                _id: "$farmerId", // Group by each farmer
                totalIncome: {
                  $sum: {
                    $cond: [
                      { $eq: ["$type", "income"] },
                      "$splitDetails.farmerPortion",
                      0,
                    ],
                  },
                },
                totalExpense: {
                  $sum: {
                    $cond: [
                      { $eq: ["$type", "expense"] },
                      "$splitDetails.farmerPortion",
                      0,
                    ],
                  },
                },
              },
            },
          ],
          as: "farmerFinancials",
        },
      },

      // Stage 3: NEW - Pre-calculate the overall field summary
      {
        $lookup: {
          from: "new_transactions",
          let: { field_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$fieldId", "$$field_id"] },
                ...dateFilter, // Apply date filter here
              },
            },
            {
              $group: {
                _id: null, // Group all transactions for the field
                totalIncome: {
                  $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
                },
                totalExpense: {
                  $sum: {
                    $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
                  },
                },
                totalOwnerIncome: {
                  $sum: {
                    $cond: [
                      { $eq: ["$type", "income"] },
                      "$splitDetails.ownerPortion",
                      0,
                    ],
                  },
                },
                totalFarmerIncome: {
                  $sum: {
                    $cond: [
                      { $eq: ["$type", "income"] },
                      "$splitDetails.farmerPortion",
                      0,
                    ],
                  },
                },
                totalOwnerExpenses: {
                  $sum: {
                    $cond: [
                      { $eq: ["$type", "expense"] },
                      "$splitDetails.ownerPortion",
                      0,
                    ],
                  },
                },
                totalFarmerExpenses: {
                  $sum: {
                    $cond: [
                      { $eq: ["$type", "expense"] },
                      "$splitDetails.farmerPortion",
                      0,
                    ],
                  },
                },
              },
            },
          ],
          as: "fieldSummaryData",
        },
      },

      // Stage 4: Lookup farmer names
      {
        $lookup: {
          from: "new_farmers",
          localField: "allocations.farmerId",
          foreignField: "_id",
          as: "farmerDetails",
        },
      },

      // Stage 5: Project and assemble everything
      {
        $project: {
          _id: { $toString: "$_id" },
          name: 1,
          totalArea: 1,
          summary: {
            // Use $let to safely access the first element of the summary array
            $let: {
              vars: { summaryDoc: { $arrayElemAt: ["$fieldSummaryData", 0] } },
              in: {
                totalIncome: { $ifNull: ["$$summaryDoc.totalIncome", 0] },
                totalExpense: { $ifNull: ["$$summaryDoc.totalExpense", 0] },
                balance: {
                  $subtract: [
                    { $ifNull: ["$$summaryDoc.totalIncome", 0] },
                    { $ifNull: ["$$summaryDoc.totalExpense", 0] },
                  ],
                },
                totalOwnerIncome: {
                  $ifNull: ["$$summaryDoc.totalOwnerIncome", 0],
                },
                totalFarmerIncome: {
                  $ifNull: ["$$summaryDoc.totalFarmerIncome", 0],
                },
                totalOwnerExpenses: {
                  $ifNull: ["$$summaryDoc.totalOwnerExpenses", 0],
                },
                totalFarmerExpenses: {
                  $ifNull: ["$$summaryDoc.totalFarmerExpenses", 0],
                },
                totalOwnerBalance: {
                  $subtract: [
                    { $ifNull: ["$$summaryDoc.totalOwnerIncome", 0] },
                    { $ifNull: ["$$summaryDoc.totalOwnerExpenses", 0] },
                  ],
                },
                totalFarmerBalance: {
                  $subtract: [
                    { $ifNull: ["$$summaryDoc.totalFarmerIncome", 0] },
                    { $ifNull: ["$$summaryDoc.totalFarmerExpenses", 0] },
                  ],
                },
              },
            },
          },
          farmers: {
            $map: {
              input: "$allocations",
              as: "alloc",
              in: {
                // Find the farmer's name
                $let: {
                  vars: {
                    farmerDoc: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$farmerDetails",
                            as: "fd",
                            cond: { $eq: ["$$fd._id", "$$alloc.farmerId"] },
                          },
                        },
                        0,
                      ],
                    },
                    financialsDoc: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$farmerFinancials",
                            as: "ff",
                            cond: { $eq: ["$$ff._id", "$$alloc.farmerId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    id: { $toString: "$$alloc.farmerId" },
                    _id: { $toString: "$$alloc.farmerId" },
                    name: "$$farmerDoc.name",
                    allocatedArea: "$$alloc.allocatedArea",
                    share: "$$alloc.share", // Assuming 'share' is the correct field name
                    totalIncome: {
                      $ifNull: ["$$financialsDoc.totalIncome", 0],
                    },
                    totalExpense: {
                      $ifNull: ["$$financialsDoc.totalExpense", 0],
                    },
                    netBalance: {
                      $subtract: [
                        { $ifNull: ["$$financialsDoc.totalIncome", 0] },
                        { $ifNull: ["$$financialsDoc.totalExpense", 0] },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    ];

    const result = await fieldsCollection.aggregate(pipeline).toArray();

    if (result.length === 0) {
      return null;
    }

    return result[0] as any; // Cast to 'any' for now, should be FieldPageData
  } catch (error) {
    console.error("Failed to fetch field detail page data:", error);
    return null;
  }
}

// Your getAvailableDateFiltersForField function is excellent and doesn't need changes.

// This function is dedicated to getting the available years and months for a field.
export async function getAvailableDateFiltersForField(
  fieldId: string
): Promise<DateRangeSelectorProps> {
  try {
    const client = await clientPromise;
    const db = client.db("farm");
    const transactionsCollection = db.collection("new_transactions");

    const fieldObjectId = new ObjectId(fieldId);

    const pipeline = [
      // Stage 1: Match only the transactions for the relevant field.
      // This is the key to performance and should use an index.
      {
        $match: {
          fieldId: fieldObjectId,
        },
      },
      // Stage 2: Group by Year and Month to get all unique combinations.
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
        },
      },
      // Stage 3: Sort the results chronologically (most recent first).
      {
        $sort: {
          "_id.year": -1,
          "_id.month": -1,
        },
      },
      // Stage 4: Group again, this time just by year, to collect all months for each year.
      {
        $group: {
          _id: "$_id.year", // Group by year
          months: { $push: "$_id.month" }, // Create an array of months for that year
        },
      },
      // Stage 5: Sort the years themselves.
      {
        $sort: {
          _id: -1, // Sort years descending (e.g., 2025, 2024, 2023)
        },
      },
    ];

    const yearMonthData = await transactionsCollection
      .aggregate(pipeline)
      .toArray();

    if (yearMonthData.length === 0) {
      return { availableYears: [], availableMonths: [] };
    }

    // --- Format the data to match the component's props ---

    const availableYears = yearMonthData.map((item) => item._id);

    const availableMonths = yearMonthData.flatMap((yearData) =>
      yearData.months.map((monthNum: number) => ({
        year: yearData._id,
        month: monthNum,
        // Create a user-friendly label for the month
        label: new Date(yearData._id, monthNum - 1).toLocaleString("default", {
          month: "long",
        }),
      }))
    );

    return { availableYears, availableMonths };
  } catch (error) {
    console.error("Failed to fetch available date filters:", error);
    return { availableYears: [], availableMonths: [] };
  }
}
