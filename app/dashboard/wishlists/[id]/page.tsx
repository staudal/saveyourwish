export default function Page({ params }: { params: { id: string } }) {
  return <div>My wishlist: {params.id}</div>;
}
