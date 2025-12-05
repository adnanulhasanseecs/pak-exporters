"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/services/api/products";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DeleteProductDialog } from "./DeleteProductDialog";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(productId);
      toast.success("Product deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete product. Please try again."
      );
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={() => setOpen(true)}
        disabled={deleting}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
      <DeleteProductDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleDelete}
        productName={productName}
      />
    </>
  );
}

