import DisplayDiv from "./DisplayDiv.tsx";

const ProjectCard = ({
                         title,
                         tags,
                         stars,
                     }: {
    title: string;
    tags: string[];
    stars: number;
}) => (
    <DisplayDiv className={" flex flex-col md:flex-row justify-between items-center w-full hover:scale-102"}>
        <div className="mb-2 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="bg-gray-700 text-xs font-medium px-2 py-1 rounded"
                    >
            {tag}
          </span>
                ))}
            </div>
        </div>
        <div className="flex items-center gap-1">
            <svg
                className="w-5 h-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927a1 1 0 011.902 0l1.286 3.957a1 1 0 00.95.69h4.166a1 1 0 01.592 1.806l-3.375 2.454a1 1 0 00-.364 1.118l1.286 3.957a1 1 0 01-1.538 1.118L10 14.347l-3.375 2.454a1 1 0 01-1.538-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.634 9.38A1 1 0 013.226 7.574h4.166a1 1 0 00.95-.69l1.286-3.957z" />
            </svg>
            <span className="font-bold">{stars}</span>
        </div>
    </DisplayDiv>

);
export default ProjectCard;