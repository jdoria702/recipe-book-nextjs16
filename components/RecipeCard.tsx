import Link from "next/link";
import Image from "next/image";

interface Props {
    title: string;
    image: string;
    slug: string;
    time: string;
}

const RecipeCard = ({ title, image, slug, time }: Props) => {
    return (
        <Link href={`recipes/${slug}`} id="recipe-card">
            <Image src={image} alt={title} width={410} height={300} className="poster" />
            <p className="title">{title}</p>
            <div>
                <Image src="icons/clock.svg" alt="clock" width={14} height={14}></Image>
                <p className="time">Estimated Time: {time} mins</p>
            </div>
            
        </Link>
    )
}

export default RecipeCard;