import { getFarmers, getFarmerConfigs } from "@/lib/newActions/farmerActions";
import EmptyState from "@/components/shared/empty-state";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import AddFarmerModal from "@/components/farmers/add-farmer-modal";

import CustomSearch from "@/components/shared/search";

export default async function FarmersPage() {
  const farmers = await getFarmers();
  const configs = await getFarmerConfigs();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Farmers</h1>
          <p className="text-muted-foreground text-lg">
            Manage farmer profiles and assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
            <CustomSearch data={farmers} baseUrl="/farmers" placeholder="Search farmers..." />
            <Link href="/farmers/configuration">
                <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurations
                </Button>
            </Link>
            <AddFarmerModal configs={configs} />
        </div>
      </div>

      {farmers.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>CNIC</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmers.map((farmer) => (
                <TableRow key={farmer._id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={farmer.imageUrl} alt={farmer.name} />
                      <AvatarFallback>
                        {farmer.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link 
                      href={`/farmers/${farmer._id}`} 
                      className="hover:underline text-primary"
                    >
                      {farmer.name}
                    </Link>
                  </TableCell>
                  <TableCell>{farmer.phone || "-"}</TableCell>
                  <TableCell>{farmer.cnic || "-"}</TableCell>
                  <TableCell>
                    <Link href={`/farmers/${farmer._id}`}>
                        <Button variant="outline" size="sm">Detail</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          title="No farmers found"
          description="Add your first farmer to get started"
        />
      )}
    </div>
  );
}
