import { notFound } from 'next/navigation';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getListingWithAddress from '@/app/actions/getListingWithAddress';
import ListingManageClient from './ListingManageClient';

interface IParams {
  listingId?: string;
}

const ListingManagePage = async ({ params }: { params: Promise<IParams> }) => {
  const resolvedParams = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return notFound();
  }

  if (!resolvedParams.listingId) {
    return notFound();
  }

  const listing = await getListingWithAddress(resolvedParams.listingId);

  if (!listing || listing.userId !== currentUser.id) {
    return notFound();
  }

  return (
    <ListingManageClient 
      listing={listing}
      currentUser={currentUser}
    />
  );
};

export default ListingManagePage;