/**
 * Format booking status for display
 */
export function formatBookingStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return statusMap[status] || status;
}

/**
 * Format enquiry type for display
 */
export function formatEnquiryType(enquiryType: string): string {
  const enquiryMap: Record<string, string> = {
    general: "General Enquiry",
    videography: "Videography",
    photography: "Photography",
    video_editing: "Video Editing",
    drone: "Drone",
    combo: "Combo",
    brand_campaign: "Brand Campaign",
    corporate: "Corporate",
  };
  return enquiryMap[enquiryType] || enquiryType;
}
